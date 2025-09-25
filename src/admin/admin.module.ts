import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { ClerkService } from './clerk.service';

@Module({
  imports: [
  ],
  providers: [AdminService, ClerkService],
  controllers: [AdminController],
})
export class AdminModule {}
