import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { Role } from '@prisma/client';

export class ChangeUserRoleDto {
  @ApiProperty({ example: 1, description: 'User ID whose role should be updated' })
  @IsNotEmpty()
  userId: number;

  @ApiProperty({ enum: Role, example: Role.ADMIN })
  @IsEnum(Role)
  role: Role;
}