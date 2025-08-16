import { IsOptional, IsInt, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class FindAllAuthorsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  skip?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  take?: number;

  @IsOptional()
  @IsString()
  search?: string;
}
