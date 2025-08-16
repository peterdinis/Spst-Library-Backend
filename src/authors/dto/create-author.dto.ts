import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDateString } from 'class-validator';

export class CreateAuthorDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  litPeriod?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateBorn?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  dateDeath?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  nationality?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bio?: string;
}
