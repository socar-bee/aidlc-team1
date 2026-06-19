import { ArrayMinSize, IsArray, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import type { ReorderMenusRequest } from '@table-order/shared-types';

export class ReorderMenusDto implements ReorderMenusRequest {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId!: number;

  @IsArray()
  @ArrayMinSize(1)
  @Type(() => Number)
  @IsInt({ each: true })
  orderedIds!: number[];
}
