import { UnauthorizedException } from '@nestjs/common';
import { createMock } from '@golevelup/ts-jest';
import { AuthService } from './auth.service';
import { StoreService } from '../../store/services/store.service';
import { AdminUserRepository } from '../repositories/admin-user.repository';
import { TableRepository } from '../repositories/table.repository';
import { PasswordService } from './password.service';
import { JwtTokenService } from './jwt-token.service';
import { StoreEntity } from '../../store/entities/store.entity';
import { AdminUserEntity } from '../entities/admin-user.entity';

describe('AuthService.adminLogin', () => {
  let storeService: jest.Mocked<StoreService>;
  let adminRepo: jest.Mocked<AdminUserRepository>;
  let password: jest.Mocked<PasswordService>;
  let jwt: jest.Mocked<JwtTokenService>;
  let service: AuthService;

  beforeEach(() => {
    storeService = createMock<StoreService>();
    adminRepo = createMock<AdminUserRepository>();
    password = createMock<PasswordService>();
    jwt = createMock<JwtTokenService>();
    service = new AuthService(
      storeService,
      adminRepo,
      createMock<TableRepository>(),
      password,
      jwt,
    );
  });

  const meta = { ip: '127.0.0.1' };
  const dto = { storeCode: 'TEST', username: 'admin', password: 'admin1234' };

  it('자격증명이 맞으면 accessToken + user 반환', async () => {
    storeService.findByCode.mockResolvedValue({ id: 7 } as StoreEntity);
    adminRepo.findByStoreAndUsername.mockResolvedValue({
      id: 1,
      storeId: 7,
      username: 'admin',
      passwordHash: 'hash',
    } as AdminUserEntity);
    password.compare.mockResolvedValue(true);
    jwt.signAdmin.mockReturnValue({ token: 'tok', expiresAt: new Date('2026-06-20T00:00:00Z') });

    const res = await service.adminLogin(dto, meta);
    expect(res.accessToken).toBe('tok');
    expect(res.user).toMatchObject({ username: 'admin', storeId: 7 });
  });

  it('비밀번호가 틀리면 UnauthorizedException', async () => {
    storeService.findByCode.mockResolvedValue({ id: 7 } as StoreEntity);
    adminRepo.findByStoreAndUsername.mockResolvedValue({
      id: 1,
      storeId: 7,
      username: 'admin',
      passwordHash: 'hash',
    } as AdminUserEntity);
    password.compare.mockResolvedValue(false);

    await expect(service.adminLogin(dto, meta)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('매장이 없으면 UnauthorizedException', async () => {
    storeService.findByCode.mockResolvedValue(null);
    await expect(service.adminLogin(dto, meta)).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
