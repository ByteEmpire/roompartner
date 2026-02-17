import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class ChatService {
  private chatGateway: any;

  constructor(private prisma: PrismaService) {}

  // ✅ Called by module to inject gateway
  setChatGateway(gateway: any) {
    this.chatGateway = gateway;
  }

  async sendMessage(senderId: string, sendMessageDto: SendMessageDto) {
    const { receiverId, content } = sendMessageDto;

    const receiver = await this.prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      throw new NotFoundException('Receiver not found');
    }

    // ✅ Create message in DB
    const message = await this.prisma.message.create({
      data: {
        content,
        senderId,
        receiverId,
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                fullName: true,
                profileImage: true,
              },
            },
          },
        },
        receiver: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    // ✅ Notify via WebSocket
    if (this.chatGateway) {
      this.chatGateway.notifyNewMessage(message);
    }

    return message;
  }

  async getMessages(userId: string, otherUserId: string) {
    const messages = await this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
      },
      orderBy: {
        createdAt: 'asc',
      },
      include: {
        sender: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                fullName: true,
                profileImage: true,
              },
            },
          },
        },
        receiver: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    await this.prisma.message.updateMany({
      where: {
        senderId: otherUserId,
        receiverId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return messages;
  }

  async getConversations(userId: string) {
    const sentMessages = await this.prisma.message.findMany({
      where: { senderId: userId },
      select: { receiverId: true },
      distinct: ['receiverId'],
    });

    const receivedMessages = await this.prisma.message.findMany({
      where: { receiverId: userId },
      select: { senderId: true },
      distinct: ['senderId'],
    });

    const userIds = [
      ...new Set([
        ...sentMessages.map((m) => m.receiverId),
        ...receivedMessages.map((m) => m.senderId),
      ]),
    ];

    const conversations = await Promise.all(
      userIds.map(async (otherUserId) => {
        const otherUser = await this.prisma.user.findUnique({
          where: { id: otherUserId },
          include: {
            profile: {
              select: {
                fullName: true,
                profileImage: true,
              },
            },
          },
        });

        const lastMessage = await this.prisma.message.findFirst({
          where: {
            OR: [
              { senderId: userId, receiverId: otherUserId },
              { senderId: otherUserId, receiverId: userId },
            ],
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        const unreadCount = await this.prisma.message.count({
          where: {
            senderId: otherUserId,
            receiverId: userId,
            isRead: false,
          },
        });

        return {
          userId: otherUser.id,
          userName: otherUser.profile?.fullName || otherUser.email,
          userImage: otherUser.profile?.profileImage,
          lastMessage,
          unreadCount,
          isOnline: false,
          isTyping: false,
        };
      }),
    );

    return conversations.sort((a, b) => {
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime();
    });
  }

  async markAsRead(userId: string, senderId: string) {
    await this.prisma.message.updateMany({
      where: {
        senderId,
        receiverId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return { success: true };
  }
}