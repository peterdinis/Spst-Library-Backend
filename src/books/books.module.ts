import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
  imports: [PrismaModule, CacheModule.register({
    ttl: 60, // default cache time-to-live (in seconds)
    max: 100, // max items (if in-memory)
  })],
  providers: [BooksService],
  controllers: [BooksController],
  exports: [BooksService],
})
export class BooksModule { }
