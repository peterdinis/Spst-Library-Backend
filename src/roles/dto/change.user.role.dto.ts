import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class ChangeUserRoleDto {
  @ApiProperty({ example: 1, description: 'User ID whose role should be updated' })
  @IsNotEmpty()
  userId: number;

  @ApiProperty()
  role: string;
}