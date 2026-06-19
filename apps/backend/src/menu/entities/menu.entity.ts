import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CategoryEntity } from '../../category/entities/category.entity';
import { StoreEntity } from '../../store/entities/store.entity';

@Entity({ name: 'menu' })
@Index('ix_menu_store_category_sort', ['storeId', 'categoryId', 'sortOrder'])
@Index('uq_menu_store_external', ['storeId', 'externalCode'], { unique: true })
export class MenuEntity {
  @PrimaryGeneratedColumn({ type: 'int' })
  id!: number;

  @Column({ type: 'int' })
  storeId!: number;

  @ManyToOne(() => StoreEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'storeId' })
  store?: StoreEntity;

  @Column({ type: 'int' })
  categoryId!: number;

  @ManyToOne(() => CategoryEntity, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'categoryId' })
  category?: CategoryEntity;

  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Column({ type: 'varchar', length: 200, nullable: true })
  nameEn!: string | null;

  /** 외부 소스(예: 스타벅스 product_CD) 식별자. 멱등 시드용 */
  @Column({ type: 'varchar', length: 64, nullable: true })
  externalCode!: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  imageUrl!: string | null;

  // --- 표준화 영양성분 (1회 제공량 기준) ---
  @Column({ type: 'int', nullable: true })
  caloriesKcal!: number | null;

  @Column({ type: 'decimal', precision: 6, scale: 1, nullable: true })
  sugarG!: string | null;

  @Column({ type: 'decimal', precision: 6, scale: 1, nullable: true })
  proteinG!: string | null;

  @Column({ type: 'int', nullable: true })
  sodiumMg!: number | null;

  @Column({ type: 'decimal', precision: 6, scale: 1, nullable: true })
  saturatedFatG!: string | null;

  @Column({ type: 'int', nullable: true })
  caffeineMg!: number | null;

  @Column({ type: 'varchar', length: 300, nullable: true })
  allergens!: string | null;

  /** 제공 규격 (예: Tall (355ml)) */
  @Column({ type: 'varchar', length: 50, nullable: true })
  servingSize!: string | null;

  @Column({ type: 'int', default: 0 })
  sortOrder!: number;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ type: 'datetime' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'datetime' })
  updatedAt!: Date;
}
