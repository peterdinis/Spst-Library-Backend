// emails.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { SendMailDto } from './dto/send-email.dto';

@Injectable()
export class EmailsService {
  private readonly logger = new Logger(EmailsService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async sendMail(emailDto: SendMailDto) {
    try {
      const info = await this.transporter.sendMail({
        from: emailDto.from,
        to: emailDto.to,
        subject: emailDto.subject,
        html: emailDto.html,
      });

      this.logger.log(`Email sent: ${info.messageId}`);
      return info;
    } catch (error) {
      this.logger.error(`Failed to send email: ${error.message}`);
      throw error;
    }
  }

  async sendVerificationCode(to: string) {
    if (!/\S+@\S+\.\S+/.test(to)) {
      throw new Error('Invalid email format');
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const mailDto: SendMailDto = {
      from: process.env.MAIL_FROM || 'noreply@example.com',
      to,
      subject: 'Your Verification Code',
      html: `<p>Your verification code is: <strong>${code}</strong></p>`,
    };

    const info = await this.sendMail(mailDto);
    return { code, info };
  }

  async sendTeacherVerificationCode(to: string) {
    if (!/\S+@\S+\.\S+/.test(to)) {
      throw new Error('Invalid email format');
    }

    const code = Array.from({ length: 8 }, () =>
      Math.random().toString(36)[2]
    ).join('').toUpperCase();

    const mailDto: SendMailDto = {
      from: process.env.MAIL_FROM || 'noreply@example.com',
      to,
      subject: 'Teacher Verification Code',
      html: `<p>Your teacher verification code is: <strong>${code}</strong></p>`,
    };

    const info = await this.sendMail(mailDto);
    return { code, info };
  }
}
