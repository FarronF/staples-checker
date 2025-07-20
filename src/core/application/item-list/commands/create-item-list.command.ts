import { Expose } from 'class-transformer';

export class CreateItemListCommand {
  @Expose()
  name!: string;

  @Expose()
  description?: string;
}
