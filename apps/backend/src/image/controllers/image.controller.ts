import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { UploadImageResponse } from '@table-order/shared-types';
import { JwtAdminGuard } from '../../auth/guards/jwt-admin.guard';
import { ImageService } from '../services/image.service';
import { multerOptions } from '../multer.config';

@Controller('images')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Post('upload')
  @UseGuards(JwtAdminGuard)
  @UseInterceptors(FileInterceptor('file', multerOptions()))
  upload(@UploadedFile() file?: Express.Multer.File): UploadImageResponse {
    if (!file) {
      throw new BadRequestException('파일이 필요합니다');
    }
    return {
      url: this.imageService.buildUrl(file.filename),
      filename: file.filename,
    };
  }
}
