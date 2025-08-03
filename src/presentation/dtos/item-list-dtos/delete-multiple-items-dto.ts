import { Expose } from 'class-transformer';
import { IsArray, IsString } from 'class-validator';

export class DeleteMultipleItemsDto {
  @Expose()
  @IsArray()
  @IsString({ each: true })
  itemNames!: string[];
}
