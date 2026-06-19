export interface TableSession {
  id: number;
  tableId: number;
  startedAt: string;
  endedAt: string | null;
}

export interface OrderPreview {
  orderNumber: string;
  itemsSummary: string;
  createdAt: string;
}

export interface TableSummary {
  tableId: number;
  tableNumber: number;
  activeSessionId: number | null;
  totalAmount: number;
  recentOrderPreviews: OrderPreview[];
}
