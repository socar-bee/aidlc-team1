import { IsInt, IsString, Max, Min, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import type { TableSetupRequest } from '@table-order/shared-types';

export class SetupTableDto implements TableSetupRequest {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(9999)
  tableNumber!: number;

  @IsString()
  @MinLength(1)
  password!: string;
}
