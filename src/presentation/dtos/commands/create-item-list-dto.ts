import { Expose } from 'class-transformer';
import { IsString, IsOptional } from 'class-validator';

export class CreateItemListDto {
  @Expose()
  @IsString()
  name!: string;

  @Expose()
  @IsOptional()
  @IsString()
  description?: string;
}
