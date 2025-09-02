import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateBookTagDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: string;
}
