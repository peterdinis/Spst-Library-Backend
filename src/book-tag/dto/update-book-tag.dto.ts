import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateBookTagDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;
}
