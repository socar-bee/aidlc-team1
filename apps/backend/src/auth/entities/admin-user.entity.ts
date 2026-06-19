import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';
import { StoreEntity } from '../../store/entities/store.entity';

@Entity({ name: 'admin_user' })
@Index('uq_admin_store_username', ['storeId', 'username'], { unique: true })
export class AdminUserEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id!: number;

  @Column({ type: 'int' })
  storeId!: number;

  @ManyToOne(() => StoreEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'storeId' })
  store?: StoreEntity;

  @Column({ type: 'varchar', length: 64 })
  username!: string;

  @Column({ type: 'varchar', length: 255 })
  passwordHash!: string;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;
}
