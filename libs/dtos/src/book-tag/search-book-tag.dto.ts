import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SearchBookTagDto {
  @ApiProperty({
    description: 'Search query for filtering book tags',
    example: 'history',
  })
  @IsNotEmpty()
  @IsString()
  q: string;
}
