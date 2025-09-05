import { IsInt, IsOptional, IsString, ValidateIf } from 'class-validator';

export class ChangeUserRoleDto {
  @IsInt()
  userId: number;

  @ValidateIf((o) => !o.roleName)
  @IsInt()
  @IsOptional()
  roleId?: number;

  @ValidateIf((o) => !o.roleId)
  @IsString()
  @IsOptional()
  roleName?: string;
}
