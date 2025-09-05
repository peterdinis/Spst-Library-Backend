import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'LIBRARIAN', description: 'Name of the new role' })
  @IsNotEmpty()
  name: string;
}
