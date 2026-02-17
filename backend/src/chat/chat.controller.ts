import { Controller, Get, Post, Body, Param, Put, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post('messages')
  sendMessage(@CurrentUser('id') userId: string, @Body() sendMessageDto: SendMessageDto) {
    return this.chatService.sendMessage(userId, sendMessageDto);
  }

  @Get('messages/:userId')
  getMessages(@CurrentUser('id') currentUserId: string, @Param('userId') otherUserId: string) {
    return this.chatService.getMessages(currentUserId, otherUserId);
  }

  @Get('conversations')
  getConversations(@CurrentUser('id') userId: string) {
    return this.chatService.getConversations(userId);
  }

  @Put('messages/read/:senderId')
  markAsRead(@CurrentUser('id') userId: string, @Param('senderId') senderId: string) {
    return this.chatService.markAsRead(userId, senderId);
  }
}