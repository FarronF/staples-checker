import { Expose, Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';

export class AddItemDto {
  @Expose()
  @IsString()
  name!: string;

  @Expose()
  @IsOptional()
  @IsString()
  description?: string;

  @Expose()
  @IsOptional()
  @IsString()
  status?: string;
}

export class AddItemsToListDto {
  @Expose()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddItemDto)
  items!: AddItemDto[];
}
