import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { CacheModule } from 'src/cache/cache.module';

@Module({
  imports: [
    PrismaModule,
    CacheModule
  ],
  providers: [BooksService],
  controllers: [BooksController],
  exports: [BooksService],
})
export class BooksModule {}
