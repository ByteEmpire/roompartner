import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createProfileDto: CreateProfileDto) {
    try {
      // Check if profile already exists
      const existingProfile = await this.prisma.profile.findUnique({
        where: { userId },
      });

      if (existingProfile) {
        throw new ConflictException('Profile already exists');
      }

      // Convert moveInDate string to Date if provided
      const data: any = {
        ...createProfileDto,
        userId,
        roomImages: createProfileDto.roomImages || [],
      };

      if (createProfileDto.moveInDate) {
        data.moveInDate = new Date(createProfileDto.moveInDate);
      }

      return await this.prisma.profile.create({
        data,
      });
    } catch (error) {
      console.error('Profile creation error:', error);
      
      if (error instanceof ConflictException) {
        throw error;
      }
      
      throw new BadRequestException(error.message || 'Failed to create profile');
    }
  }

  async findByUserId(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  async update(userId: string, updateProfileDto: UpdateProfileDto) {
    try {
      const profile = await this.prisma.profile.findUnique({
        where: { userId },
      });

      if (!profile) {
        throw new NotFoundException('Profile not found');
      }

      // Convert moveInDate string to Date if provided
      const data: any = {
        ...updateProfileDto,
        lastActive: new Date(),
      };

      if (updateProfileDto.moveInDate) {
        data.moveInDate = new Date(updateProfileDto.moveInDate);
      }

      return await this.prisma.profile.update({
        where: { userId },
        data,
      });
    } catch (error) {
      console.error('Profile update error:', error);
      
      if (error instanceof NotFoundException) {
        throw error;
      }
      
      throw new BadRequestException(error.message || 'Failed to update profile');
    }
  }

  async delete(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    await this.prisma.profile.delete({
      where: { userId },
    });

    return { message: 'Profile deleted successfully' };
  }

  async updateLastActive(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (profile) {
      await this.prisma.profile.update({
        where: { userId },
        data: { lastActive: new Date() },
      });
    }
  }
}
