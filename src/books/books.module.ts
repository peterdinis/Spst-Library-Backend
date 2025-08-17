import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { CacheModule } from '@nestjs/cache-manager';
import { StudentGuard, TeacherGuard } from 'src/permissions/guards/roles.guard';

@Module({
  imports: [
    PrismaModule,
    CacheModule.register({
      ttl: 60, // default cache time-to-live (in seconds)
      max: 100, // max items (if in-memory)
    }),
  ],
  providers: [BooksService, TeacherGuard, StudentGuard],
  controllers: [BooksController],
  exports: [BooksService],
})
export class BooksModule {}
