import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { StoreEntity } from '../../store/entities/store.entity';

@Entity({ name: 'restaurant_table' })
@Index('uq_table_store_number', ['storeId', 'tableNumber'], { unique: true })
export class TableEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id!: number;

  @Column({ type: 'int' })
  storeId!: number;

  @ManyToOne(() => StoreEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'storeId' })
  store?: StoreEntity;

  @Column({ type: 'int' })
  tableNumber!: number;

  @Column({ type: 'varchar', length: 255 })
  passwordHash!: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;
}
