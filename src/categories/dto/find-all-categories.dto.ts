import { IsInt, IsOptional, IsPositive, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FindAllCategoriesDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'skip must be an integer' })
  @Min(0, { message: 'skip cannot be negative' })
  skip?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'take must be an integer' })
  @IsPositive({ message: 'take must be greater than 0' })
  take?: number = 10;

  @IsOptional()
  @IsString({ message: 'search must be a string' })
  search?: string;
}
