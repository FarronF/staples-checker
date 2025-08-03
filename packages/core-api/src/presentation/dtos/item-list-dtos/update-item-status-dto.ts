import { Expose } from 'class-transformer';
import { IsEnum } from 'class-validator';
import { ItemStatus } from '../../../core/domain/item-list/item-status';

export class UpdateItemStatusDto {
  @Expose()
  @IsEnum(ItemStatus)
  status!: ItemStatus;
}
