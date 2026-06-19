import { existsSync, mkdirSync } from 'fs';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const MAX_BYTES = 5 * 1024 * 1024;

export function uploadDir(): string {
  const dir = process.env.IMAGE_UPLOAD_DIR ?? '/var/lib/uploads';
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export function multerOptions(): MulterOptions {
  return {
    storage: diskStorage({
      destination: (_req, _file, cb) => cb(null, uploadDir()),
      filename: (_req, file, cb) => {
        const ext = extname(file.originalname).toLowerCase();
        cb(null, `${uuidv4()}${ext || '.bin'}`);
      },
    }),
    fileFilter: (_req, file, cb) => {
      const ext = extname(file.originalname).toLowerCase();
      if (!ALLOWED_MIME.has(file.mimetype) || !ALLOWED_EXT.has(ext)) {
        cb(new BadRequestException('지원하지 않는 이미지 형식입니다 (jpg/png/webp)'), false);
        return;
      }
      cb(null, true);
    },
    limits: {
      fileSize: MAX_BYTES,
      files: 1,
    },
  };
}
