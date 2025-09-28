import { Module } from '@nestjs/common';
import { BookTagController } from './book-tag.controller';
import { BookTagService } from './book-tag.service';

@Module({
  imports: [],
  controllers: [BookTagController],
  providers: [BookTagService],
})
export class BookTagModule {}
