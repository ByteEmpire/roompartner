import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers = new Map<string, string>();

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = client.handshake.auth.token;
      
      if (!token) {
        console.log('❌ No token provided');
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
      });

      client.userId = payload.sub;
      this.connectedUsers.set(payload.sub, client.id);

      // Broadcast to ALL users that this user is online
      this.server.emit('userOnline', { userId: payload.sub, isOnline: true });

      // Send list of all currently online users to the new connection
      const onlineUserIds = Array.from(this.connectedUsers.keys());
      client.emit('onlineUsers', { userIds: onlineUserIds });

      console.log(`✅ User connected: ${payload.sub} (${client.id})`);
      console.log(`👥 Total online: ${this.connectedUsers.size}`);
    } catch (error) {
      console.error('❌ Connection error:', error.message);
      client.emit('error', { message: 'Authentication failed' });
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.connectedUsers.delete(client.userId);
      
      // Broadcast to ALL users that this user is offline
      this.server.emit('userOffline', { userId: client.userId, isOnline: false });
      
      console.log(`❌ User disconnected: ${client.userId}`);
      console.log(`👥 Total online: ${this.connectedUsers.size}`);
    }
  }

  notifyNewMessage(message: any) {
    const receiverSocketId = this.connectedUsers.get(message.receiverId);
    const senderSocketId = this.connectedUsers.get(message.senderId);

    const messageData = {
      id: message.id,
      content: message.content,
      senderId: message.senderId,
      receiverId: message.receiverId,
      createdAt: message.createdAt,
      isRead: message.isRead,
    };

    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('receiveMessage', messageData);
      console.log('📨 Message sent to receiver via socket');
    }

    if (senderSocketId) {
      this.server.to(senderSocketId).emit('messageSent', messageData);
      console.log('✅ Message confirmation sent to sender');
    }
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { receiverId: string; isTyping: boolean },
  ) {
    const receiverSocketId = this.connectedUsers.get(data.receiverId);
    if (receiverSocketId) {
      this.server.to(receiverSocketId).emit('userTyping', {
        userId: client.userId,
        receiverId: data.receiverId,
        isTyping: data.isTyping,
      });
    }
  }

  @SubscribeMessage('getOnlineStatus')
  handleGetOnlineStatus(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { userId: string },
  ) {
    const isOnline = this.connectedUsers.has(data.userId);
    client.emit('onlineStatus', { userId: data.userId, isOnline });
    console.log(`🔍 Online status check for ${data.userId}: ${isOnline}`);
  }

  //  Get all online users
  @SubscribeMessage('getAllOnlineUsers')
  handleGetAllOnlineUsers(@ConnectedSocket() client: AuthenticatedSocket) {
    const onlineUserIds = Array.from(this.connectedUsers.keys());
    client.emit('onlineUsers', { userIds: onlineUserIds });
    console.log(`📋 Sent ${onlineUserIds.length} online users to ${client.userId}`);
  }
}