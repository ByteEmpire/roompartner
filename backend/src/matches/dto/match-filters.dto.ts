import { IsOptional, IsString, IsInt, IsEnum, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { Gender, OccupationType, FoodPreference } from '@prisma/client';

export class MatchFiltersDto {
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  minBudget?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  maxBudget?: number;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsEnum(OccupationType)
  occupationType?: OccupationType;

  @IsOptional()
  @IsEnum(FoodPreference)
  foodPreference?: FoodPreference;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  limit?: number;
}