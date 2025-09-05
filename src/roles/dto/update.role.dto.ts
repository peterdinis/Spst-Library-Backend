import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateRoleDto } from './create.role.dto';

export class UpdateRoleDto extends PartialType(CreateRoleDto) {
  @ApiProperty({ example: 'Updated role name', required: false })
  name?: string;
}
