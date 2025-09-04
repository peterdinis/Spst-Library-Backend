import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BookTagController } from './book-tag.controller';
import { BookTagService } from './book-tag.service';

@Module({
  imports: [PrismaModule],
  controllers: [BookTagController],
  providers: [BookTagService],
})
export class BookTagModule {}
