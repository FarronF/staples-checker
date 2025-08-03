import { Expose } from 'class-transformer';
import { ItemDto } from './item-dto';
import { ParticipantDto } from './participant-dto';

export class ItemListDto {
  @Expose()
  id!: string;

  @Expose()
  name!: string;

  @Expose()
  description?: string;

  @Expose()
  items?: ItemDto[];

  @Expose()
  participants?: ParticipantDto[];

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;
}
