import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ServeStaticModule } from '@nestjs/serve-static';

import { typeOrmConfig } from './config/typeorm.config';
import { envValidation } from './config/env.validation';
import { uploadDir } from './image/multer.config';
import { CommonModule } from './common/common.module';
import { StoreModule } from './store/store.module';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { MenuModule } from './menu/menu.module';
import { ImageModule } from './image/image.module';
import { SessionModule } from './session/session.module';
import { OrderModule } from './order/order.module';
import { TableModule } from './table/table.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: envValidation,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => typeOrmConfig(),
    }),
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      maxListeners: 100,
    }),
    ServeStaticModule.forRootAsync({
      useFactory: () => [
        {
          rootPath: uploadDir(),
          serveRoot: '/static/uploads',
          serveStaticOptions: {
            maxAge: '7d',
            immutable: false,
          },
        },
      ],
    }),
    CommonModule,
    StoreModule,
    AuthModule,
    CategoryModule,
    MenuModule,
    ImageModule,
    SessionModule,
    OrderModule,
    TableModule,
  ],
})
export class AppModule {}
