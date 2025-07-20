import { Expose, Transform } from 'class-transformer';
import { IsArray, IsEnum, IsOptional } from 'class-validator';
import { ItemStatus } from '../../../../core/domain/item-list/item-status';

export class GetItemsByStatusQuery {
  @Expose()
  @IsOptional()
  @IsArray()
  @IsEnum(ItemStatus, { each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map((s) => s.trim());
    }
    return value;
  })
  statuses?: ItemStatus[];
}
