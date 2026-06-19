import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { ENTITIES } from '../config/typeorm.config';

dotenv.config();

export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 3306),
  username: process.env.DB_USER ?? 'tableorder',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'table_order',
  entities: ENTITIES,
  migrations: [__dirname + '/[0-9]*{.ts,.js}'],
  synchronize: false,
  timezone: 'Z',
  charset: 'utf8mb4',
});
