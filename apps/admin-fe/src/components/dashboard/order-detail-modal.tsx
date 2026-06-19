'use client';

import {
  ORDER_STATUS_FORWARD_TRANSITIONS,
  OrderStatus,
} from '@table-order/shared-types';
import type { Order } from '@table-order/shared-types';
import {
  useCancelOrder,
  useChangeOrderStatus,
  useTableCurrentOrders,
} from '@/lib/queries/dashboard';
import { StatusBadge } from './status-badge';
import { EndSessionButton } from '@/components/table/end-session-button';

const NEXT_LABEL: Partial<Record<OrderStatus, string>> = {
  [OrderStatus.PREPARING]: '준비 시작',
  [OrderStatus.COMPLETED]: '완료 처리',
};

/** 다음 정방향 상태 (CANCELED 제외) */
function nextStatus(status: OrderStatus): OrderStatus | null {
  return (
    ORDER_STATUS_FORWARD_TRANSITIONS[status].find((s) => s !== OrderStatus.CANCELED) ?? null
  );
}

interface Props {
  tableId: number;
  tableNumber: number;
  onClose: () => void;
}

export function OrderDetailModal({ tableId, tableNumber, onClose }: Props): JSX.Element {
  const { data, isLoading } = useTableCurrentOrders(tableId);
  const changeStatus = useChangeOrderStatus();
  const cancelOrder = useCancelOrder();

  const onAdvance = (order: Order): void => {
    const next = nextStatus(order.status);
    if (next) changeStatus.mutate({ id: order.id, next });
  };

  const onDelete = (order: Order): void => {
    if (!window.confirm(`주문 ${order.orderNumber}을(를) 정말 삭제하시겠습니까?`)) return;
    cancelOrder.mutate(order.id);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
      data-testid="order-detail-modal"
    >
      <div
        className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-xl bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-bold text-slate-800">테이블 {tableNumber} 주문</h2>
          <div className="flex items-center gap-2">
            <EndSessionButton
              tableId={tableId}
              onEnded={onClose}
              className="rounded-md bg-red-500 px-3 py-1.5 text-xs font-medium text-white"
            />
            <button
              type="button"
              onClick={onClose}
              className="text-sm text-slate-500"
              data-testid="modal-close"
            >
              닫기
            </button>
          </div>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
          {isLoading && <p className="text-center text-sm text-slate-400">불러오는 중...</p>}
          {!isLoading && (data?.length ?? 0) === 0 && (
            <p className="py-8 text-center text-sm text-slate-400" data-testid="modal-empty">
              진행 중인 주문이 없습니다
            </p>
          )}

          {data?.map((order) => {
            const next = nextStatus(order.status);
            return (
              <article
                key={order.id}
                className="rounded-lg border border-slate-200 p-3"
                data-testid={`detail-order-${order.id}`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-800">
                    주문 {order.orderNumber}
                  </span>
                  <StatusBadge status={order.status} />
                </div>
                <ul className="space-y-1">
                  {order.items.map((it) => (
                    <li
                      key={it.id ?? it.menuId}
                      className="flex justify-between text-sm text-slate-600"
                    >
                      <span>
                        {it.menuName} × {it.quantity}
                      </span>
                      <span>₩{(it.unitPrice * it.quantity).toLocaleString('ko-KR')}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
                  <span className="text-base font-bold text-blue-600">
                    ₩{order.totalAmount.toLocaleString('ko-KR')}
                  </span>
                  <div className="flex gap-2">
                    {next && (
                      <button
                        type="button"
                        onClick={() => onAdvance(order)}
                        disabled={changeStatus.isPending}
                        className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60"
                        data-testid={`advance-${order.id}`}
                      >
                        {NEXT_LABEL[next]}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onDelete(order)}
                      disabled={cancelOrder.isPending}
                      className="rounded-md border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 disabled:opacity-60"
                      data-testid={`delete-${order.id}`}
                    >
                      삭제
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
