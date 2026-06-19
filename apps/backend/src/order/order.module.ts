import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderEntity } from './entities/order.entity';
import { OrderItemEntity } from './entities/order-item.entity';
import { OrderService } from './services/order.service';
import { OrderRepository } from './repositories/order.repository';
import { OrderController } from './controllers/order.controller';
import { AuthModule } from '../auth/auth.module';
import { SessionModule } from '../session/session.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderEntity, OrderItemEntity]),
    AuthModule,
    SessionModule,
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderRepository],
  exports: [OrderService, OrderRepository, TypeOrmModule],
})
export class OrderModule {}
