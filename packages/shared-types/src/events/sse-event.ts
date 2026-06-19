import { SseEventType } from '../enums/sse-event-type';

export interface SseEvent<T = unknown> {
  id: string;
  type: SseEventType;
  data: T;
}
