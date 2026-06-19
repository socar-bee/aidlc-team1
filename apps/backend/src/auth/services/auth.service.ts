import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import type {
  AdminLoginRequest,
  AdminLoginResponse,
  AdminUserPayload,
  TablePayload,
  TableSetupRequest,
  TableSetupResponse,
} from '@table-order/shared-types';
import { StoreService } from '../../store/services/store.service';
import { AdminUserRepository } from '../repositories/admin-user.repository';
import { TableRepository } from '../repositories/table.repository';
import { PasswordService } from './password.service';
import { JwtTokenService } from './jwt-token.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger('Auth');

  constructor(
    private readonly storeService: StoreService,
    private readonly adminUserRepo: AdminUserRepository,
    private readonly tableRepo: TableRepository,
    private readonly passwordService: PasswordService,
    private readonly jwtTokenService: JwtTokenService,
  ) {}

  async adminLogin(
    dto: AdminLoginRequest,
    meta: { ip: string },
  ): Promise<AdminLoginResponse> {
    const store = await this.storeService.findByCode(dto.storeCode);
    const generic = new UnauthorizedException('로그인 정보를 확인하세요');

    if (!store) {
      this.logLoginAttempt({ ...dto, ip: meta.ip, success: false, reason: 'store_not_found' });
      throw generic;
    }

    const admin = await this.adminUserRepo.findByStoreAndUsername(store.id, dto.username);
    if (!admin) {
      this.logLoginAttempt({ ...dto, ip: meta.ip, success: false, reason: 'user_not_found' });
      throw generic;
    }

    const ok = await this.passwordService.compare(dto.password, admin.passwordHash);
    if (!ok) {
      this.logLoginAttempt({ ...dto, ip: meta.ip, success: false, reason: 'bad_password' });
      throw generic;
    }

    const payload: AdminUserPayload = {
      id: admin.id,
      storeId: admin.storeId,
      username: admin.username,
    };
    const { token, expiresAt } = this.jwtTokenService.signAdmin(payload);
    this.logLoginAttempt({ ...dto, ip: meta.ip, success: true });
    return {
      accessToken: token,
      expiresAt: expiresAt.toISOString(),
      user: payload,
    };
  }

  async setupTable(
    dto: TableSetupRequest,
    admin: AdminUserPayload,
  ): Promise<TableSetupResponse> {
    const passwordHash = await this.passwordService.hash(dto.password);
    const existing = await this.tableRepo.findByStoreAndNumber(admin.storeId, dto.tableNumber);
    const saved = await this.tableRepo.upsert({
      id: existing?.id,
      storeId: admin.storeId,
      tableNumber: dto.tableNumber,
      passwordHash,
    });

    const tablePayload: TablePayload = {
      tableId: saved.id,
      storeId: saved.storeId,
      tableNumber: saved.tableNumber,
    };
    const { token } = this.jwtTokenService.signTable(tablePayload);
    return {
      tableToken: token,
      table: { id: saved.id, tableNumber: saved.tableNumber },
    };
  }

  validateAdminToken(token: string): AdminUserPayload {
    return this.jwtTokenService.verify(token, 'admin');
  }

  validateTableToken(token: string): TablePayload {
    return this.jwtTokenService.verify(token, 'table');
  }

  private logLoginAttempt(input: {
    storeCode: string;
    username: string;
    ip: string;
    success: boolean;
    reason?: string;
  }): void {
    this.logger.log(
      JSON.stringify({
        event: 'admin_login_attempt',
        storeCode: input.storeCode,
        username: input.username,
        ip: input.ip,
        success: input.success,
        reason: input.reason,
        timestamp: new Date().toISOString(),
      }),
    );
  }
}
