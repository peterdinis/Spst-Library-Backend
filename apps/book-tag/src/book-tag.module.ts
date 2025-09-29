import { Module } from '@nestjs/common';
import { BookTagController } from './book-tag.controller';
import { BookTagService } from './book-tag.service';
import { DatabaseModule } from '@app/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookTag, BookTagSchema } from './models/book-tag.model';

@Module({
  imports: [
    DatabaseModule,
    MongooseModule.forFeature([
      {
        name: BookTag.name,
        schema: BookTagSchema,
      },
    ]),
  ],
  controllers: [BookTagController],
  providers: [BookTagService],
})
export class BookTagModule {}
