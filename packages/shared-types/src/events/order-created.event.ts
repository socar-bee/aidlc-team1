export interface OrderCreatedEvent {
  orderId: number;
  tableId: number;
  sessionId: number;
  orderNumber: string;
  totalAmount: number;
  createdAt: string;
}
