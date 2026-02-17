import { SetMetadata } from '@nestjs/common';
import { SubscriptionPlan } from '@prisma/client';

export const RequireSubscription = (plan: SubscriptionPlan) => SetMetadata('requiredPlan', plan);