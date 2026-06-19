/**
 * 통합 테스트 (대표 1) — Auth 로그인 플로우.
 * 실제 MySQL(Testcontainers) + Nest 앱 부트 + Supertest.
 *
 * 실행: docker 데몬 필요.
 *   pnpm --filter @table-order/backend test:integration
 *
 * 흐름: MySQL 컨테이너 기동 → 스키마 생성(throwaway DataSource synchronize)
 *       → 매장/관리자 seed → 앱 부트 → POST /auth/admin/login 200/401 검증.
 */
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import request from 'supertest';
import { MySqlContainer, StartedMySqlContainer } from '@testcontainers/mysql';
import { AppModule } from '../src/app.module';
import { ENTITIES } from '../src/config/typeorm.config';
import { StoreEntity } from '../src/store/entities/store.entity';
import { AdminUserEntity } from '../src/auth/entities/admin-user.entity';

jest.setTimeout(120000);

describe('Auth 통합 (POST /auth/admin/login)', () => {
  let container: StartedMySqlContainer;
  let app: INestApplication;

  beforeAll(async () => {
    container = await new MySqlContainer('mysql:8.4')
      .withDatabase('table_order')
      .withUsername('tableorder')
      .withUserPassword('changeme_app')
      .start();

    // 앱이 참조할 DB 접속 정보 주입
    process.env.DB_HOST = container.getHost();
    process.env.DB_PORT = String(container.getPort());
    process.env.DB_NAME = 'table_order';
    process.env.DB_USER = 'tableorder';
    process.env.DB_PASSWORD = 'changeme_app';
    process.env.JWT_SECRET = 'integration-secret-0123456789abcdef0123456789';
    process.env.IMAGE_UPLOAD_DIR = '/tmp/uploads-test';
    process.env.CORS_ORIGINS = 'http://localhost:3000';

    // 스키마 생성 + seed (synchronize 로 엔티티 기반 테이블 생성)
    const seedDs = new DataSource({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: ENTITIES,
      synchronize: true,
    });
    await seedDs.initialize();
    const store = await seedDs
      .getRepository(StoreEntity)
      .save(seedDs.getRepository(StoreEntity).create({ name: '테스트매장', code: 'TEST' }));
    await seedDs.getRepository(AdminUserEntity).save(
      seedDs.getRepository(AdminUserEntity).create({
        storeId: store.id,
        username: 'admin',
        passwordHash: await bcrypt.hash('admin1234', 12),
      }),
    );
    await seedDs.destroy();

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
    await container?.stop();
  });

  it('올바른 자격증명이면 200 + accessToken', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/admin/login')
      .send({ storeCode: 'TEST', username: 'admin', password: 'admin1234' })
      .expect(200);
    expect(res.body.accessToken).toEqual(expect.any(String));
    expect(res.body.user).toMatchObject({ username: 'admin' });
  });

  it('비밀번호가 틀리면 401', async () => {
    await request(app.getHttpServer())
      .post('/auth/admin/login')
      .send({ storeCode: 'TEST', username: 'admin', password: 'wrong' })
      .expect(401);
  });
});
