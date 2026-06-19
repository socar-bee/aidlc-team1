import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrderStatus } from '@table-order/shared-types';
import { TableEntity } from '../../auth/entities/table.entity';
import { TableSessionEntity } from '../../session/entities/table-session.entity';
import { OrderItemEntity } from './order-item.entity';

@Entity({ name: 'app_order' })
@Index('uq_order_number', ['orderNumber'], { unique: true })
@Index('ix_order_session_status_created', ['sessionId', 'status', 'createdAt'])
@Index('ix_order_table_created', ['tableId', 'createdAt'])
export class OrderEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id!: number;

  @Column({ type: 'int' })
  sessionId!: number;

  @ManyToOne(() => TableSessionEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'sessionId' })
  session?: TableSessionEntity;

  @Column({ type: 'int' })
  tableId!: number;

  @ManyToOne(() => TableEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'tableId' })
  table?: TableEntity;

  @Column({ type: 'varchar', length: 32 })
  orderNumber!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalAmount!: string;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.PENDING })
  status!: OrderStatus;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @Column({ type: 'datetime', nullable: true })
  canceledAt!: Date | null;

  @OneToMany(() => OrderItemEntity, (item) => item.order, { cascade: true })
  items?: OrderItemEntity[];
}
