import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        subscription: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { passwordHash, refreshToken, ...userWithoutSensitive } = user;
    return userWithoutSensitive;
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
        subscription: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { passwordHash, refreshToken, ...userWithoutSensitive } = user;
    return userWithoutSensitive;
  }

  async findMany() {
    const users = await this.prisma.user.findMany({
      include: {
        profile: true,
        subscription: true,
      },
    });

    return users.map(({ passwordHash, refreshToken, ...user }) => user);
  }
}