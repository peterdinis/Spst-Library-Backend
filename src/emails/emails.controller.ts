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
}
