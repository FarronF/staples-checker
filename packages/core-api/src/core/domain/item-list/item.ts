import { Expose } from 'class-transformer';
import { ItemStatus } from './item-status';
import { IsEnum } from 'class-validator';

export class Item {
  @Expose()
  name!: string;
  @Expose()
  @IsEnum(ItemStatus)
  status!: ItemStatus;
  @Expose()
  createdAt!: Date;
  @Expose()
  updatedAt!: Date;
}
