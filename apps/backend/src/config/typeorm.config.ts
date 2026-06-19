import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { StoreEntity } from '../store/entities/store.entity';
import { AdminUserEntity } from '../auth/entities/admin-user.entity';
import { TableEntity } from '../auth/entities/table.entity';
import { CategoryEntity } from '../category/entities/category.entity';
import { MenuEntity } from '../menu/entities/menu.entity';
import { TableSessionEntity } from '../session/entities/table-session.entity';
import { OrderEntity } from '../order/entities/order.entity';
import { OrderItemEntity } from '../order/entities/order-item.entity';

export const ENTITIES = [
  StoreEntity,
  AdminUserEntity,
  TableEntity,
  CategoryEntity,
  MenuEntity,
  TableSessionEntity,
  OrderEntity,
  OrderItemEntity,
];

export function typeOrmConfig(): TypeOrmModuleOptions {
  return {
    type: 'mysql',
    host: process.env.DB_HOST!,
    port: Number(process.env.DB_PORT ?? 3306),
    username: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    entities: ENTITIES,
    migrations: [__dirname + '/../migrations/[0-9]*{.ts,.js}'],
    synchronize: false,
    timezone: 'Z',
    charset: 'utf8mb4',
    logging: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    extra: {
      connectionLimit: 10,
    },
  };
}
