import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BooksController } from './books.controller';
import { DatabaseModule } from '@app/common';
import { Book, BookSchema } from './model/book.model';
import { BooksService } from './books.service';

@Module({
  imports: [
    DatabaseModule,
    MongooseModule.forFeature([{ name: Book.name, schema: BookSchema }]),
  ],
  controllers: [BooksController],
  providers: [BooksService],
  exports: [MongooseModule],
})
export class BooksModule {}
