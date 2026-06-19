import { OrderStatus } from '../enums/order-status';

export interface OrderStatusChangedEvent {
  orderId: number;
  tableId: number;
  status: OrderStatus;
}
