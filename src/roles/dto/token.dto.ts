import { IsInt, IsString } from 'class-validator';

export class TokenDto {
  @IsInt()
  id: number;

  @IsString()
  role: string;
}
