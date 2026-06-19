/* eslint-disable no-console */
import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { copyFileSync, existsSync, readFileSync } from 'fs';
import { extname, join } from 'path';
import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ENTITIES } from '../config/typeorm.config';
import { StoreEntity } from '../store/entities/store.entity';
import { CategoryEntity } from '../category/entities/category.entity';
import { MenuEntity } from '../menu/entities/menu.entity';
import { uploadDir } from '../image/multer.config';

dotenv.config();

const STORE_CODE = 'TANGHUO';
const STORE_NAME = '탕화쿵푸 (마라탕)';
const DATA_DIR = join(__dirname, '../../seed-data/tanghuo');

interface Item {
  externalCode: string;
  category: string;
  catOrder: number;
  sortOrder: number;
  nameKo: string;
  nameEn: string | null;
  price: number;
  description: string | null;
  imageFile: string | null;
}

function placeImage(imageFile: string | null): string | null {
  if (!imageFile) return null;
  const src = join(DATA_DIR, 'images', imageFile);
  if (!existsSync(src)) return null;
  const dest = `${uuidv4()}${extname(imageFile) || '.webp'}`;
  copyFileSync(src, join(uploadDir(), dest));
  return `/static/uploads/${dest}`;
}

async function main(): Promise<void> {
  const items: Item[] = JSON.parse(
    readFileSync(join(DATA_DIR, 'menu.json'), 'utf-8'),
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
  console.log('[seed:th] DB 연결 OK');

  let created = 0;
  let updated = 0;
  try {
    await dataSource.transaction(async (manager) => {
      const storeRepo = manager.getRepository(StoreEntity);
      const categoryRepo = manager.getRepository(CategoryEntity);
      const menuRepo = manager.getRepository(MenuEntity);

      let store = await storeRepo.findOne({ where: { code: STORE_CODE } });
      if (!store) {
        store = await storeRepo.save(
          storeRepo.create({ code: STORE_CODE, name: STORE_NAME }),
        );
        console.log(`[seed:th] Store created: ${store.code}`);
      }

      // 카테고리 (등장 순서)
      const catCache = new Map<string, CategoryEntity>();
      const catOrder = new Map<string, number>();
      for (const it of items) {
        if (!catOrder.has(it.category)) catOrder.set(it.category, it.catOrder);
      }
      for (const [name, sortOrder] of catOrder) {
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

      // 메뉴 (storeId + externalCode 멱등)
      for (const it of items) {
        const cat = catCache.get(it.category)!;
        const existing = await menuRepo.findOne({
          where: { storeId: store.id, externalCode: it.externalCode },
        });
        const base = {
          storeId: store.id,
          categoryId: cat.id,
          name: it.nameKo,
          nameEn: it.nameEn,
          externalCode: it.externalCode,
          price: it.price.toFixed(2),
          description: it.description,
          // 마라탕 토핑 — 영양성분 미제공이라 null, 표준화 스키마상 허용
          caloriesKcal: null,
          sugarG: null,
          proteinG: null,
          sodiumMg: null,
          saturatedFatG: null,
          caffeineMg: null,
          allergens: null,
          servingSize: '100g',
          sortOrder: it.sortOrder,
          isActive: true,
        };
        if (existing) {
          const imageUrl = existing.imageUrl ?? placeImage(it.imageFile);
          await menuRepo.save({ ...existing, ...base, imageUrl });
          updated++;
        } else {
          await menuRepo.save(
            menuRepo.create({ ...base, imageUrl: placeImage(it.imageFile) }),
          );
          created++;
        }
      }
    });

    console.log(`\n[seed:th] ✅ 완료 — created=${created}, updated=${updated}, total=${items.length}`);
    console.log(`Store code: ${STORE_CODE}`);
  } finally {
    await dataSource.destroy();
  }
}

main().catch((err) => {
  console.error('[seed:th] ❌ 실패:', err);
  process.exit(1);
});
