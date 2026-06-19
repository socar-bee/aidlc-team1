/* eslint-disable no-console */
import 'reflect-metadata';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';
import { copyFileSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ENTITIES } from '../config/typeorm.config';
import { StoreEntity } from '../store/entities/store.entity';
import { AdminUserEntity } from '../auth/entities/admin-user.entity';
import { CategoryEntity } from '../category/entities/category.entity';
import { MenuEntity } from '../menu/entities/menu.entity';
import { uploadDir } from '../image/multer.config';

dotenv.config();

const STORE_CODE = 'STARBUCKS';
const STORE_NAME = '스타벅스 (표준 데이터)';
const SB_ADMIN_USERNAME = process.env.SB_ADMIN_USERNAME ?? 'admin';
const SB_ADMIN_PASSWORD = process.env.SB_ADMIN_PASSWORD ?? 'admin1234';
const DATA_DIR = join(__dirname, '../../seed-data/starbucks');

interface Drink {
  externalCode: string;
  category: string;
  nameKo: string;
  nameEn: string | null;
  price: number;
  description: string | null;
  caloriesKcal: number | null;
  sugarG: number | null;
  proteinG: number | null;
  sodiumMg: number | null;
  saturatedFatG: number | null;
  caffeineMg: number | null;
  allergens: string | null;
  servingSize: string | null;
  imageFile: string | null;
  catOrder: number;
  sortOrder: number;
}

/** seed-data 이미지를 업로드 디렉터리로 복사하고 서빙 URL 반환 */
function placeImage(imageFile: string | null): string | null {
  if (!imageFile) return null;
  const src = join(DATA_DIR, 'images', imageFile);
  if (!existsSync(src)) return null;
  const dest = `${uuidv4()}.jpg`;
  copyFileSync(src, join(uploadDir(), dest));
  return `/static/uploads/${dest}`;
}

async function main(): Promise<void> {
  const drinks: Drink[] = JSON.parse(
    readFileSync(join(DATA_DIR, 'drinks.json'), 'utf-8'),
  );

  const dataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 3306),
    username: process.env.DB_USER ?? 'tableorder',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? 'table_order',
    entities: ENTITIES,
    synchronize: false,
    timezone: 'Z',
    charset: 'utf8mb4',
  });

  await dataSource.initialize();
  console.log('[seed:sb] DB 연결 OK');

  let created = 0;
  let updated = 0;
  try {
    await dataSource.transaction(async (manager) => {
      const storeRepo = manager.getRepository(StoreEntity);
      const adminRepo = manager.getRepository(AdminUserEntity);
      const categoryRepo = manager.getRepository(CategoryEntity);
      const menuRepo = manager.getRepository(MenuEntity);

      // 1. Store
      let store = await storeRepo.findOne({ where: { code: STORE_CODE } });
      if (!store) {
        store = await storeRepo.save(
          storeRepo.create({ code: STORE_CODE, name: STORE_NAME }),
        );
        console.log(`[seed:sb] Store created: ${store.code}`);
      }

      // 1-1. Admin User (storeId + username 기준 멱등)
      const existingAdmin = await adminRepo.findOne({
        where: { storeId: store.id, username: SB_ADMIN_USERNAME },
      });
      if (!existingAdmin) {
        const hash = await bcrypt.hash(SB_ADMIN_PASSWORD, 12);
        const admin = await adminRepo.save(
          adminRepo.create({
            storeId: store.id,
            username: SB_ADMIN_USERNAME,
            passwordHash: hash,
          }),
        );
        console.log(`[seed:sb] Admin created: ${admin.username} / password=${SB_ADMIN_PASSWORD}`);
      } else {
        console.log(`[seed:sb] Admin exists: ${SB_ADMIN_USERNAME}`);
      }

      // 2. Categories (등장 순서 = catOrder)
      const catCache = new Map<string, CategoryEntity>();
      const catOrderByName = new Map<string, number>();
      for (const d of drinks) {
        if (!catOrderByName.has(d.category)) {
          catOrderByName.set(d.category, d.catOrder);
        }
      }
      for (const [name, sortOrder] of catOrderByName) {
        let cat = await categoryRepo.findOne({
          where: { storeId: store.id, name },
        });
        if (!cat) {
          cat = await categoryRepo.save(
            categoryRepo.create({ storeId: store.id, name, sortOrder }),
          );
        }
        catCache.set(name, cat);
      }

      // 3. Menus (storeId + externalCode 기준 멱등 upsert)
      for (const d of drinks) {
        const cat = catCache.get(d.category)!;
        const existing = await menuRepo.findOne({
          where: { storeId: store.id, externalCode: d.externalCode },
        });
        const base = {
          storeId: store.id,
          categoryId: cat.id,
          name: d.nameKo,
          nameEn: d.nameEn,
          externalCode: d.externalCode,
          price: d.price.toFixed(2),
          description: d.description,
          caloriesKcal: d.caloriesKcal,
          sugarG: d.sugarG?.toFixed(1) ?? null,
          proteinG: d.proteinG?.toFixed(1) ?? null,
          sodiumMg: d.sodiumMg,
          saturatedFatG: d.saturatedFatG?.toFixed(1) ?? null,
          caffeineMg: d.caffeineMg,
          allergens: d.allergens,
          servingSize: d.servingSize,
          sortOrder: d.sortOrder,
          isActive: true,
        };
        if (existing) {
          const imageUrl = existing.imageUrl ?? placeImage(d.imageFile);
          await menuRepo.save({ ...existing, ...base, imageUrl });
          updated++;
        } else {
          await menuRepo.save(
            menuRepo.create({ ...base, imageUrl: placeImage(d.imageFile) }),
          );
          created++;
        }
      }
    });

    console.log(`\n[seed:sb] ✅ 완료 — created=${created}, updated=${updated}, total=${drinks.length}`);
    console.log(`Store code:     ${STORE_CODE}`);
    console.log(`Admin username: ${SB_ADMIN_USERNAME}`);
    console.log(`Admin password: ${SB_ADMIN_PASSWORD}`);
  } finally {
    await dataSource.destroy();
  }
}

main().catch((err) => {
  console.error('[seed:sb] ❌ 실패:', err);
  process.exit(1);
});
