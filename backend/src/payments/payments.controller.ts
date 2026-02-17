import { Controller, Post, Get, Body, Headers, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';

@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {
    console.log('💳 PaymentsController initialized');
  }

  @UseGuards(JwtAuthGuard)
  @Post('create-order')
  @HttpCode(HttpStatus.OK)
  createOrder(@CurrentUser('id') userId: string, @Body() createOrderDto: CreateOrderDto) {
    console.log('📝 Create order request:', { userId, plan: createOrderDto.plan });
    return this.paymentsService.createOrder(userId, createOrderDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  verifyPayment(@CurrentUser('id') userId: string, @Body() verifyPaymentDto: VerifyPaymentDto) {
    console.log('✅ Verify payment request:', userId);
    return this.paymentsService.verifyPayment(userId, verifyPaymentDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('history')
  getPaymentHistory(@CurrentUser('id') userId: string) {
    console.log('📜 Payment history request:', userId);
    return this.paymentsService.getPaymentHistory(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('cancel-subscription')
  @HttpCode(HttpStatus.OK)
  cancelSubscription(@CurrentUser('id') userId: string) {
    console.log('❌ Cancel subscription request:', userId);
    return this.paymentsService.cancelSubscription(userId);
  }

  @Public()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  handleWebhook(@Headers('x-razorpay-signature') signature: string, @Body() payload: any) {
    console.log('🔔 Webhook received');
    return this.paymentsService.handleWebhook(signature, payload);
  }
}