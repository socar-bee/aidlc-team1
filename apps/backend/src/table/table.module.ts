import { Module } from '@nestjs/common';
import { TableController } from './controllers/table.controller';
import { TableService } from './services/table.service';
import { AuthModule } from '../auth/auth.module';
import { OrderModule } from '../order/order.module';
import { SessionModule } from '../session/session.module';

@Module({
  imports: [AuthModule, OrderModule, SessionModule],
  controllers: [TableController],
  providers: [TableService],
})
export class TableModule {}
