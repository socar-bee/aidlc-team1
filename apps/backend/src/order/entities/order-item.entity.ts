import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrderEntity } from './order.entity';

@Entity({ name: 'order_item' })
@Index('ix_order_item_order', ['orderId'])
export class OrderItemEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id!: number;

  @Column({ type: 'int' })
  orderId!: number;

  @ManyToOne(() => OrderEntity, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order?: OrderEntity;

  @Column({ type: 'int' })
  menuId!: number;

  @Column({ type: 'varchar', length: 200 })
  menuNameSnapshot!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unitPriceSnapshot!: string;

  @Column({ type: 'int' })
  quantity!: number;
}
