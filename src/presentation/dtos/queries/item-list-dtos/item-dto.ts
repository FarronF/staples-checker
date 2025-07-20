import { Expose } from 'class-transformer';

export class ItemDto {
  @Expose()
  name!: string;

  @Expose()
  status?: string;

  @Expose()
  createdAt!: Date;

  @Expose()
  updatedAt!: Date;
}
