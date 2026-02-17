import { Module, OnModuleInit } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { ChatGateway } from './chat.gateway';

@Module({
  imports: [JwtModule.register({})],
  controllers: [ChatController],
  providers: [ChatService, ChatGateway],
})
export class ChatModule implements OnModuleInit {
  constructor(
    private chatService: ChatService,
    private chatGateway: ChatGateway,
  ) {}

  onModuleInit() {
    // ✅ Connect service to gateway
    this.chatService.setChatGateway(this.chatGateway);
  }
}