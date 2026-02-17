import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MatchFiltersDto } from './dto/match-filters.dto';

@Injectable()
export class MatchesService {
  constructor(private prisma: PrismaService) {}

  async findMatches(userId: string, filters: MatchFiltersDto) {
    const currentUserProfile = await this.prisma.profile.findUnique({
      where: { userId },
    });
  
    if (!currentUserProfile) {
      return [];
    }
  
    // ✅ GET USER'S SUBSCRIPTION
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });
  
    // ✅ SET MATCH LIMITS BASED ON PLAN
    let matchLimit = 5; // Free users: 5 matches
    if (subscription && subscription.status === 'ACTIVE') {
      if (subscription.plan === 'BASIC') {
        matchLimit = 20;
      } else if (subscription.plan === 'PREMIUM') {
        matchLimit = 50;
      } else if (subscription.plan === 'ELITE') {
        matchLimit = 100;
      }
    }
  
    const where: any = {
      userId: { not: userId },
      isActive: true,
    };
  
    if (filters.city) {
      where.city = { contains: filters.city, mode: 'insensitive' };
    }
  
    if (filters.minBudget || filters.maxBudget) {
      where.budget = {};
      if (filters.minBudget) where.budget.gte = filters.minBudget;
      if (filters.maxBudget) where.budget.lte = filters.maxBudget;
    }
  
    if (filters.gender) where.gender = filters.gender;
    if (filters.occupationType) where.occupationType = filters.occupationType;
    if (filters.foodPreference) where.foodPreference = filters.foodPreference;
  
    const limit = Math.min(filters.limit || matchLimit, matchLimit);
  
    const profiles = await this.prisma.profile.findMany({
      where,
      take: limit,
      orderBy: {
        lastActive: 'desc',
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
            subscription: {
              select: {
                plan: true,
                status: true,
              },
            },
          },
        },
      },
    });
  
    return profiles.map((profile) => ({
      id: profile.user.id,
      email: profile.user.email,
      role: profile.user.role,
      createdAt: profile.user.createdAt,
      isPremium: profile.user.subscription?.plan === 'PREMIUM' || profile.user.subscription?.plan === 'ELITE',
      isVerified: profile.user.subscription?.plan === 'ELITE',
      profile: {
        id: profile.id,
        fullName: profile.fullName,
        age: profile.age,
        gender: profile.gender,
        bio: profile.bio,
        profileImage: profile.profileImage,
        city: profile.city,
        locality: profile.locality,
        budget: profile.budget,
        moveInDate: profile.moveInDate,
        preferredGender: profile.preferredGender,
        occupationType: profile.occupationType,
        foodPreference: profile.foodPreference,
        drinking: profile.drinking,
        smoking: profile.smoking,
        pets: profile.pets,
        roomImages: profile.roomImages,
        lastActive: profile.lastActive,
      },
    }));
  }

  async getMatchScore(userId: string, targetUserId: string) {
    const [userProfile, targetProfile] = await Promise.all([
      this.prisma.profile.findUnique({ where: { userId } }),
      this.prisma.profile.findUnique({ where: { userId: targetUserId } }),
    ]);

    if (!userProfile || !targetProfile) {
      return { score: 0 };
    }

    let score = 0;
    const maxScore = 100;

    if (userProfile.city === targetProfile.city) {
      score += 30;
    }

    const budgetDiff = Math.abs(userProfile.budget - targetProfile.budget);
    const budgetScore = Math.max(0, 25 - (budgetDiff / userProfile.budget) * 25);
    score += budgetScore;

    if (userProfile.occupationType === targetProfile.occupationType) {
      score += 15;
    }

    if (userProfile.foodPreference === targetProfile.foodPreference) {
      score += 10;
    }

    const lifestyleMatches = [
      userProfile.drinking === targetProfile.drinking,
      userProfile.smoking === targetProfile.smoking,
      userProfile.pets === targetProfile.pets,
    ].filter(Boolean).length;
    score += (lifestyleMatches / 3) * 20;

    return {
      score: Math.round(score),
      maxScore,
      percentage: Math.round((score / maxScore) * 100),
    };
  }
}