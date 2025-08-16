import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SendMailDto {
  @ApiProperty({ example: 'recipient@example.com' })
  @IsEmail()
  to: string;

  @ApiProperty({ example: 'Hello from NestJS' })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ example: '<b>This is a test email</b>' })
  @IsString()
  @IsNotEmpty()
  html: string;
}
