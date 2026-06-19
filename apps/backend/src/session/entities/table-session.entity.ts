import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TableEntity } from '../../auth/entities/table.entity';

@Entity({ name: 'table_session' })
@Index('ix_session_table_ended', ['tableId', 'endedAt'])
export class TableSessionEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id!: number;

  @Column({ type: 'int' })
  tableId!: number;

  @ManyToOne(() => TableEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tableId' })
  table?: TableEntity;

  @CreateDateColumn({ type: 'datetime', name: 'startedAt' })
  startedAt!: Date;

  @Column({ type: 'datetime', nullable: true })
  endedAt!: Date | null;
}
