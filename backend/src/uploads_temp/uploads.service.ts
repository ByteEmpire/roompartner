import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class UploadsService {
  constructor(private configService: ConfigService) {
    const cloudName = this.configService.get('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get('CLOUDINARY_API_SECRET');

    console.log('🔧 Cloudinary Config:', {
      cloudName,
      apiKey: apiKey ? `${apiKey.substring(0, 6)}...` : 'MISSING',
      apiSecret: apiSecret ? 'SET' : 'MISSING',
    });

    if (!cloudName || !apiKey || !apiSecret) {
      console.error('❌ Cloudinary credentials missing in .env file');
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
  }

  async getSignedUploadParams(folder: 'profile' | 'room') {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const uploadPreset = folder === 'profile' ? 'roompartner_profile' : 'roompartner_room';
    const cloudName = this.configService.get('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get('CLOUDINARY_API_SECRET');

    if (!cloudName || !apiKey || !apiSecret) {
      throw new BadRequestException('Cloudinary not configured. Check backend .env file.');
    }

    // Generate signature
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        upload_preset: uploadPreset,
      },
      apiSecret,
    );

    console.log('🔑 Generated upload signature for folder:', folder);

    return {
      cloudinaryUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      apiKey,
      timestamp,
      signature,
      uploadPreset,
      cloudName,
    };
  }

  async deleteImage(publicId: string) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return { success: result.result === 'ok' };
    } catch (error) {
      console.error('Cloudinary deletion error:', error);
      throw new BadRequestException('Failed to delete image');
    }
  }

  async uploadBase64Image(base64Image: string, folder: 'profile' | 'room') {
    try {
      const result = await cloudinary.uploader.upload(base64Image, {
        folder: `roompartner/${folder}`,
        transformation: [
          { width: 800, height: 800, crop: 'limit' },
          { quality: 'auto' },
          { fetch_format: 'auto' },
        ],
      });

      return {
        url: result.secure_url,
        publicId: result.public_id,
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new BadRequestException('Failed to upload image');
    }
  }

  extractPublicId(cloudinaryUrl: string): string {
    const parts = cloudinaryUrl.split('/');
    const filename = parts[parts.length - 1];
    const publicId = filename.split('.')[0];
    const folder = parts.slice(-3, -1).join('/');
    return `${folder}/${publicId}`;
  }
}