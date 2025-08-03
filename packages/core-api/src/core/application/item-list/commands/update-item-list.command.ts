import { Expose } from 'class-transformer';

export class UpdateItemListCommand {
  @Expose()
  name?: string;

  @Expose()
  description?: string;
}
