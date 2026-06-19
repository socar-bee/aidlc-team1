import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { IsEnum } from 'class-validator';
import {
  OrderStatus,
  type AdminUserPayload,
  type ChangeOrderStatusRequest,
  type Order,
  type TablePayload,
} from '@table-order/shared-types';
import { OrderService } from '../services/order.service';
import { CreateOrderDto } from '../dto';
import { TableTokenGuard } from '../../auth/guards/table-token.guard';
import { JwtAdminGuard } from '../../auth/guards/jwt-admin.guard';
import { CurrentTable } from '../../common/decorators/current-table.decorator';
import { CurrentAdmin } from '../../common/decorators/current-admin.decorator';

class ChangeStatusDto implements ChangeOrderStatusRequest {
  @IsEnum(OrderStatus)
  next!: OrderStatus;
}

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  /** 현재 세션 주문 내역 (Customer) */
  @Get('current')
  @UseGuards(TableTokenGuard)
  listCurrent(@CurrentTable() table: TablePayload): Promise<Order[]> {
    return this.orderService.listCurrentBySession(table);
  }

  @Post()
  @UseGuards(TableTokenGuard)
  create(
    @Body() dto: CreateOrderDto,
    @CurrentTable() table: TablePayload,
  ): Promise<Order> {
    return this.orderService.create(dto, table);
  }

  /** 주문 상태 변경 (Admin) */
  @Patch(':id/status')
  @UseGuards(JwtAdminGuard)
  changeStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ChangeStatusDto,
    @CurrentAdmin() admin: AdminUserPayload,
  ): Promise<Order> {
    return this.orderService.changeStatus(id, dto.next, admin);
  }

  /** 주문 삭제 = soft-delete (CANCELED) (Admin) */
  @Delete(':id')
  @UseGuards(JwtAdminGuard)
  cancel(
    @Param('id', ParseIntPipe) id: number,
    @CurrentAdmin() admin: AdminUserPayload,
  ): Promise<Order> {
    return this.orderService.cancel(id, admin);
  }
}
