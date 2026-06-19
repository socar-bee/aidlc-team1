import { IsString, MinLength } from 'class-validator';
import type { AdminLoginRequest } from '@table-order/shared-types';

export class AdminLoginDto implements AdminLoginRequest {
  @IsString()
  @MinLength(1)
  storeCode!: string;

  @IsString()
  @MinLength(1)
  username!: string;

  @IsString()
  @MinLength(1)
  password!: string;
}
