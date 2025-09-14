import { IsEmail, IsEnum, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role} from 'src/roles/utils/roles';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'strongPassword123' })
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({
    example: Role.STUDENT,
    enum: Role,
    description: 'User role (e.g. STUDENT, ADMIN, TEACHER)',
  })
  @IsNotEmpty()
  @IsEnum(Role)
  role: Role;
}