import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  UseGuards,
} from '@nestjs/common';
import type {
  AdminLoginResponse,
  AdminUserPayload,
  TableSetupResponse,
} from '@table-order/shared-types';
import { AuthService } from '../services/auth.service';
import { AdminLoginDto, SetupTableDto } from '../dto';
import { JwtAdminGuard } from '../guards/jwt-admin.guard';
import { CurrentAdmin } from '../../common/decorators/current-admin.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  adminLogin(@Body() dto: AdminLoginDto, @Ip() ip: string): Promise<AdminLoginResponse> {
    return this.authService.adminLogin(dto, { ip });
  }

  @Post('table/setup')
  @UseGuards(JwtAdminGuard)
  @HttpCode(HttpStatus.OK)
  setupTable(
    @Body() dto: SetupTableDto,
    @CurrentAdmin() admin: AdminUserPayload,
  ): Promise<TableSetupResponse> {
    return this.authService.setupTable(dto, admin);
  }
}
