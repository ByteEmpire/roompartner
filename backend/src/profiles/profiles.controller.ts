import { Controller, Get, Post, Put, Delete, Body, UseGuards } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('profiles')
@UseGuards(JwtAuthGuard)
export class ProfilesController {
  constructor(private profilesService: ProfilesService) {}

  @Post()
  create(@CurrentUser('id') userId: string, @Body() createProfileDto: CreateProfileDto) {
    return this.profilesService.create(userId, createProfileDto);
  }

  @Get('me')
  findMe(@CurrentUser('id') userId: string) {
    return this.profilesService.findByUserId(userId);
  }

  @Put('me')
  update(@CurrentUser('id') userId: string, @Body() updateProfileDto: UpdateProfileDto) {
    return this.profilesService.update(userId, updateProfileDto);
  }

  @Delete('me')
  delete(@CurrentUser('id') userId: string) {
    return this.profilesService.delete(userId);
  }
}