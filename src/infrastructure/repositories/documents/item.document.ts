import { Expose } from 'class-transformer';

export class ItemDocument {
  @Expose()
  name!: string;

  @Expose()
  status!: string;

  @Expose()
  updatedAt!: Date;

  @Expose()
  createdAt!: Date;
}
