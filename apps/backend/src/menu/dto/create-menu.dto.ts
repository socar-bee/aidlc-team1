import {
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import type { CreateMenuRequest } from '@table-order/shared-types';

export class CreateMenuDto implements CreateMenuRequest {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId!: number;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  name!: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  price!: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  imageUrl?: string;
}
