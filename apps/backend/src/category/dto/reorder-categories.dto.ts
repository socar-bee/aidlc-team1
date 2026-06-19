import { ArrayMinSize, IsArray, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import type { ReorderCategoriesRequest } from '@table-order/shared-types';

export class ReorderCategoriesDto implements ReorderCategoriesRequest {
  @IsArray()
  @ArrayMinSize(1)
  @Type(() => Number)
  @IsInt({ each: true })
  orderedIds!: number[];
}
