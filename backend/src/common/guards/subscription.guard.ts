import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma/prisma.service';
import { SubscriptionPlan } from '@prisma/client';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPlan = this.reflector.get<SubscriptionPlan>('requiredPlan', context.getHandler());
    
    if (!requiredPlan) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user.id;

    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    // Check if subscription exists and is active
    if (!subscription || subscription.status !== 'ACTIVE') {
      throw new ForbiddenException('This feature requires an active subscription. Please upgrade your plan.');
    }

    // Check plan hierarchy: ELITE > PREMIUM > BASIC
    const planHierarchy = {
      BASIC: 1,
      PREMIUM: 2,
      ELITE: 3,
    };

    const userPlanLevel = planHierarchy[subscription.plan];
    const requiredPlanLevel = planHierarchy[requiredPlan];

    if (userPlanLevel < requiredPlanLevel) {
      throw new ForbiddenException(`This feature requires ${requiredPlan} plan or higher. Please upgrade.`);
    }

    return true;
  }
}