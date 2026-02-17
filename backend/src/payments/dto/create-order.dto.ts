import { IsEnum } from 'class-validator';
import { SubscriptionPlan } from '@prisma/client';

export class CreateOrderDto {
  @IsEnum(SubscriptionPlan)
  plan: SubscriptionPlan;
}