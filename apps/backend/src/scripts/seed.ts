/* eslint-disable no-console */
import 'reflect-metadata';
import * as dotenv from 'dotenv';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { ENTITIES } from '../config/typeorm.config';
import { StoreEntity } from '../store/entities/store.entity';
import { AdminUserEntity } from '../auth/entities/admin-user.entity';
import { CategoryEntity } from '../category/entities/category.entity';
import { MenuEntity } from '../menu/entities/menu.entity';

dotenv.config();

const SEED_STORE_CODE = process.env.SEED_STORE_CODE ?? 'TEST';
const SEED_STORE_NAME = process.env.SEED_STORE_NAME ?? '테스트 매장';
const SEED_ADMIN_USERNAME = process.env.SEED_ADMIN_USERNAME ?? 'admin';
const SEED_ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'admin1234';

interface SeedMenu {
  name: string;
  price: number;
  description?: string;
}

const SEED_DATA: Array<{ category: string; menus: SeedMenu[] }> = [
  {
    category: '음료',
    menus: [
      { name: '아메리카노', price: 4500, description: '깔끔하고 진한 에스프레소 베이스' },
      { name: '카페라떼', price: 5000, description: '부드러운 우유와 에스프레소' },
      { name: '레몬에이드', price: 5500, description: '상큼한 수제 레몬에이드' },
    ],
  },
  {
    category: '메인',
    menus: [
      { name: '치킨 샐러드', price: 12000, description: '구운 닭가슴살 + 신선한 채소' },
      { name: '파스타 알리오올리오', price: 13500, description: '마늘 향이 진한 클래식 파스타' },
      { name: '스테이크 덮밥', price: 15500, description: '미디엄 레어 소고기 스테이크 덮밥' },
    ],
  },
  {
    category: '디저트',
    menus: [
      { name: '티라미수', price: 7000, description: '진한 마스카포네 크림' },
      { name: '치즈케이크', price: 6500, description: '뉴욕 스타일 클래식' },
    ],
  },
];

async function main(): Promise<void> {
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
  console.log('[seed] DB 연결 OK');

  try {
    await dataSource.transaction(async (manager) => {
      // 1. Store
      const storeRepo = manager.getRepository(StoreEntity);
      let store = await storeRepo.findOne({ where: { code: SEED_STORE_CODE } });
      if (!store) {
        store = await storeRepo.save(
          storeRepo.create({ code: SEED_STORE_CODE, name: SEED_STORE_NAME }),
        );
        console.log(`[seed] Store created: ${store.code} (${store.name})`);
      } else {
        console.log(`[seed] Store exists: ${store.code}`);
      }

      // 2. Admin User
      const adminRepo = manager.getRepository(AdminUserEntity);
      const existingAdmin = await adminRepo.findOne({
        where: { storeId: store.id, username: SEED_ADMIN_USERNAME },
      });
      if (!existingAdmin) {
        const hash = await bcrypt.hash(SEED_ADMIN_PASSWORD, 12);
        const admin = await adminRepo.save(
          adminRepo.create({
            storeId: store.id,
            username: SEED_ADMIN_USERNAME,
            passwordHash: hash,
          }),
        );
        console.log(`[seed] Admin created: ${admin.username} / password=${SEED_ADMIN_PASSWORD}`);
      } else {
        console.log(`[seed] Admin exists: ${SEED_ADMIN_USERNAME}`);
      }

      // 3. Categories & Menus
      const categoryRepo = manager.getRepository(CategoryEntity);
      const menuRepo = manager.getRepository(MenuEntity);

      for (let i = 0; i < SEED_DATA.length; i++) {
        const cur = SEED_DATA[i]!;
        let cat = await categoryRepo.findOne({
          where: { storeId: store.id, name: cur.category },
        });
        if (!cat) {
          cat = await categoryRepo.save(
            categoryRepo.create({
              storeId: store.id,
              name: cur.category,
              sortOrder: i + 1,
            }),
          );
          console.log(`[seed] Category created: ${cat.name}`);
        }

        for (let j = 0; j < cur.menus.length; j++) {
          const m = cur.menus[j]!;
          const existing = await menuRepo.findOne({
            where: { storeId: store.id, categoryId: cat.id, name: m.name },
          });
          if (!existing) {
            await menuRepo.save(
              menuRepo.create({
                storeId: store.id,
                categoryId: cat.id,
                name: m.name,
                price: m.price.toFixed(2),
                description: m.description ?? null,
                imageUrl: null,
                sortOrder: j + 1,
                isActive: true,
              }),
            );
            console.log(`[seed]   Menu created: ${m.name} (₩${m.price.toLocaleString()})`);
          }
        }
      }
    });

    console.log('\n[seed] ✅ 시드 완료');
    console.log('---');
    console.log(`Store code:     ${SEED_STORE_CODE}`);
    console.log(`Admin username: ${SEED_ADMIN_USERNAME}`);
    console.log(`Admin password: ${SEED_ADMIN_PASSWORD}`);
    console.log('---');
  } finally {
    await dataSource.destroy();
  }
}

main().catch((err) => {
  console.error('[seed] ❌ 실패:', err);
  process.exit(1);
});
