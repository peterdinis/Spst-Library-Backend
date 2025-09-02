import { IsNotEmpty, IsString } from 'class-validator';

export class SearchBookTagDto {
  @IsNotEmpty()
  @IsString()
  q: string;
}
