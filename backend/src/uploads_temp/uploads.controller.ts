import { Controller, Get, Post, Delete, Body, Query, UseGuards } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  constructor(private uploadsService: UploadsService) {}

  @Get('signature/profile')
  getProfileSignature() {
    return this.uploadsService.getSignedUploadParams('profile');
  }

  @Get('signature/room')
  getRoomSignature() {
    return this.uploadsService.getSignedUploadParams('room');
  }

  @Post('base64')
  uploadBase64(
    @Body('image') image: string,
    @Body('folder') folder: 'profile' | 'room',
  ) {
    return this.uploadsService.uploadBase64Image(image, folder);
  }

  @Delete('image')
  deleteImage(@Query('url') url: string) {
    const publicId = this.uploadsService.extractPublicId(url);
    return this.uploadsService.deleteImage(publicId);
  }
}