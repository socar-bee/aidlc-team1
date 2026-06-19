import { IsString, MaxLength, MinLength } from 'class-validator';
import type { CreateCategoryRequest } from '@table-order/shared-types';

export class CreateCategoryDto implements CreateCategoryRequest {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;
}
