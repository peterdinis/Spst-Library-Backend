// emails.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SendMailDto } from './dto/send-email.dto';
import { EmailsService } from './emails.service';

@ApiTags('mail')
@Controller('mail')
export class EmailsController {
  constructor(private readonly mailService: EmailsService) {}

  @Post('send')
  @ApiOperation({ summary: 'Send an email using Mailtrap' })
  @ApiResponse({ status: 201, description: 'Email sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async sendMail(@Body() dto: SendMailDto) {
    return this.mailService.sendMail(dto);
  }
  
  @Post('verify')
  @ApiOperation({ summary: 'Send a verification code to email' })
  @ApiResponse({ status: 201, description: 'Verification code sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async sendVerificationCode(@Body('email') email: string) {
    return this.mailService.sendVerificationCode(email);
  }
}
