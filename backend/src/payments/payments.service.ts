import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
const Razorpay = require('razorpay');  
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { SubscriptionPlan, PaymentStatus, SubscriptionStatus } from '@prisma/client';

@Injectable()
export class PaymentsService {
  private razorpay: any;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const keyId = this.configService.get('RAZORPAY_KEY_ID');
    const keySecret = this.configService.get('RAZORPAY_KEY_SECRET');

    console.log('💳 Razorpay Config:', {
      keyId: keyId ? `${keyId.substring(0, 10)}...` : 'MISSING',
      keySecret: keySecret ? 'SET' : 'MISSING',
    });

    this.razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  private getPlanAmount(plan: SubscriptionPlan): number {
    const prices = {
      BASIC: 50,
      PREMIUM: 100,
      ELITE: 150,
    };
    return prices[plan] * 100;
  }

  async createOrder(userId: string, createOrderDto: CreateOrderDto) {
    const { plan } = createOrderDto;
    const amount = this.getPlanAmount(plan);

    console.log('📝 Creating order:', { userId, plan, amount });

    try {
      const razorpayOrder = await this.razorpay.orders.create({
        amount,
        currency: 'INR',
        receipt: `receipt_${Date.now()}`,
        notes: {
          userId,
          plan,
        },
      });

      const payment = await this.prisma.payment.create({
        data: {
          userId,
          razorpayOrderId: razorpayOrder.id,
          amount,
          currency: 'INR',
          status: PaymentStatus.CREATED,
          plan,
        },
      });

      console.log('✅ Order created:', razorpayOrder.id);

      return {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        plan,
      };
    } catch (error) {
      console.error('❌ Razorpay order creation failed:', error);
      throw new BadRequestException('Failed to create payment order');
    }
  }

  async verifyPayment(userId: string, verifyPaymentDto: VerifyPaymentDto) {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = verifyPaymentDto;

    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', this.configService.get('RAZORPAY_KEY_SECRET'))
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      await this.prisma.payment.updateMany({
        where: { razorpayOrderId },
        data: { status: PaymentStatus.FAILED },
      });

      throw new BadRequestException('Payment verification failed');
    }

    const payment = await this.prisma.payment.findUnique({
      where: { razorpayOrderId },
    });

    if (!payment) {
      throw new BadRequestException('Payment not found');
    }

    await this.prisma.payment.update({
      where: { razorpayOrderId },
      data: {
        razorpayPaymentId,
        razorpaySignature,
        status: PaymentStatus.CAPTURED,
      },
    });

    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    const existingSubscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (existingSubscription) {
      await this.prisma.subscription.update({
        where: { userId },
        data: {
          plan: payment.plan,
          status: SubscriptionStatus.ACTIVE,
          startDate,
          endDate,
        },
      });
    } else {
      await this.prisma.subscription.create({
        data: {
          userId,
          plan: payment.plan,
          status: SubscriptionStatus.ACTIVE,
          startDate,
          endDate,
        },
      });
    }

    return {
      success: true,
      message: 'Payment verified and subscription activated',
      plan: payment.plan,
      endDate,
    };
  }

  async getPaymentHistory(userId: string) {
    const payments = await this.prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return payments;
  }

  async handleWebhook(signature: string, payload: any) {
    const webhookSecret = this.configService.get('RAZORPAY_WEBHOOK_SECRET');
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(payload))
      .digest('hex');

    if (signature !== expectedSignature) {
      throw new BadRequestException('Invalid webhook signature');
    }

    const event = payload.event;
    const paymentData = payload.payload.payment.entity;

    console.log('Webhook event:', event);

    switch (event) {
      case 'payment.captured':
        await this.handlePaymentCaptured(paymentData);
        break;
      case 'payment.failed':
        await this.handlePaymentFailed(paymentData);
        break;
      default:
        console.log('Unhandled webhook event:', event);
    }

    return { success: true };
  }

  private async handlePaymentCaptured(paymentData: any) {
    await this.prisma.payment.updateMany({
      where: { razorpayOrderId: paymentData.order_id },
      data: {
        razorpayPaymentId: paymentData.id,
        status: PaymentStatus.CAPTURED,
      },
    });
  }

  private async handlePaymentFailed(paymentData: any) {
    await this.prisma.payment.updateMany({
      where: { razorpayOrderId: paymentData.order_id },
      data: {
        status: PaymentStatus.FAILED,
      },
    });
  }

  async cancelSubscription(userId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscription) {
      throw new BadRequestException('No active subscription found');
    }

    await this.prisma.subscription.update({
      where: { userId },
      data: { status: SubscriptionStatus.CANCELLED },
    });

    return {
      success: true,
      message: 'Subscription cancelled successfully',
    };
  }
}