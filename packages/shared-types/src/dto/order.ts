import { OrderStatus } from '../enums/order-status';

export interface OrderItem {
  id?: number;
  menuId: number;
  menuName: string;
  unitPrice: number;
  quantity: number;
}

export interface Order {
  id: number;
  sessionId: number;
  tableId: number;
  orderNumber: string;
  totalAmount: number;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: string;
  canceledAt: string | null;
}

export interface CreateOrderRequest {
  items: Array<{
    menuId: number;
    quantity: number;
  }>;
}

export interface ChangeOrderStatusRequest {
  next: OrderStatus;
}

export interface OrderListResponse {
  orders: Order[];
  total: number;
}
