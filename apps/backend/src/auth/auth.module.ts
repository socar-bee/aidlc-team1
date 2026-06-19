import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminUserEntity } from './entities/admin-user.entity';
import { TableEntity } from './entities/table.entity';
import { AuthService } from './services/auth.service';
import { JwtTokenService } from './services/jwt-token.service';
import { PasswordService } from './services/password.service';
import { AdminUserRepository } from './repositories/admin-user.repository';
import { TableRepository } from './repositories/table.repository';
import { AuthController } from './controllers/auth.controller';
import { JwtAdminGuard } from './guards/jwt-admin.guard';
import { OptionalAuthGuard } from './guards/optional-auth.guard';
import { TableTokenGuard } from './guards/table-token.guard';
import { StoreModule } from '../store/store.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AdminUserEntity, TableEntity]),
    StoreModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtTokenService,
    PasswordService,
    AdminUserRepository,
    TableRepository,
    JwtAdminGuard,
    OptionalAuthGuard,
    TableTokenGuard,
  ],
  exports: [
    AuthService,
    JwtTokenService,
    JwtAdminGuard,
    OptionalAuthGuard,
    TableTokenGuard,
    TableRepository,
    TypeOrmModule,
  ],
})
export class AuthModule {}
