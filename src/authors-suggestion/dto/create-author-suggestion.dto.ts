import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAuthorSuggestionDto {
  @ApiProperty({ description: 'Meno autora alebo autorky' })
  @IsNotEmpty({ message: 'Meno autora je povinné' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Krátka biografia autora' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ description: 'Literárne obdobie autora' })
  @IsNotEmpty({ message: 'Literárne obdobie je povinné' })
  @IsString()
  litPeriod: string;

  @ApiPropertyOptional({ description: 'URL obrázku autora' })
  @IsOptional()
  @IsString()
  authorImage?: string;

  @ApiProperty({ description: 'Dátum narodenia autora' })
  @IsNotEmpty({ message: 'Dátum narodenia je povinný' })
  @IsString()
  bornDate: string;

  @ApiPropertyOptional({ description: 'Dátum úmrtia autora' })
  @IsOptional()
  @IsString()
  deathDate?: string;

  @ApiPropertyOptional({ description: 'Meno osoby, ktorá navrhla autora (pre nepřihláseného používateľa)' })
  @IsOptional()
  @IsString()
  suggestedByName?: string;
}

export class UpdateAuthorSuggestionStatusDto {
  @ApiProperty({ enum: ['APPROVED', 'REJECTED'], description: 'Nový status návrhu' })
  @IsNotEmpty()
  @IsString()
  status: 'APPROVED' | 'REJECTED';
}
