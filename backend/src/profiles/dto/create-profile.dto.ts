import { IsString, IsInt, IsEnum, IsOptional, IsBoolean, IsArray, IsDateString, Min, Max, IsUrl } from 'class-validator';
import { Gender, GenderPreference, OccupationType, FoodPreference } from '@prisma/client';

export class CreateProfileDto {
  @IsString()
  fullName: string;

  @IsInt()
  @Min(18)
  @Max(100)
  age: number;

  @IsEnum(Gender)
  gender: Gender;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  profileImage?: string;  // ✅ ADDED

  @IsString()
  city: string;

  @IsOptional()
  @IsString()
  locality?: string;

  @IsInt()
  @Min(0)
  budget: number;

  @IsOptional()
  @IsDateString()
  moveInDate?: string;

  @IsEnum(GenderPreference)
  preferredGender: GenderPreference;

  @IsEnum(OccupationType)
  occupationType: OccupationType;

  @IsOptional()
  @IsEnum(FoodPreference)
  foodPreference?: FoodPreference;

  @IsOptional()
  @IsBoolean()
  drinking?: boolean;

  @IsOptional()
  @IsBoolean()
  smoking?: boolean;

  @IsOptional()
  @IsBoolean()
  pets?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roomImages?: string[];
}