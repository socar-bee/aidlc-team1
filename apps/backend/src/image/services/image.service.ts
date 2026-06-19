import { Injectable } from '@nestjs/common';
import { join } from 'path';
import { uploadDir } from '../multer.config';

@Injectable()
export class ImageService {
  buildUrl(filename: string): string {
    return `/static/uploads/${filename}`;
  }

  resolveAbsolute(filename: string): string {
    return join(uploadDir(), filename);
  }
}
