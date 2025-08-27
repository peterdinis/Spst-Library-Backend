import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { EmailsModule } from 'src/emails/emails.module';

@Module({
  imports: [PrismaModule, EmailsModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
