import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { ClerkService } from './clerk.service';
import { CategoryModule } from 'src/category/category.module';
import { BooksModule } from 'src/books/books.module';
import { AuthorsModule } from 'src/authors/authors.module';
import { RatingModule } from 'src/rating/rating.module';
import { AuthorsSuggestionModule } from 'src/authors-suggestion/authors-suggestion.module';
import { BookTagModule } from 'src/book-tag/book-tag.module';

@Module({
  imports: [
    CategoryModule,
    BooksModule,
    AuthorsModule,
    RatingModule,
    AuthorsSuggestionModule,
    RatingModule,
    BookTagModule,
  ],
  providers: [AdminService, ClerkService],
  controllers: [AdminController],
})
export class AdminModule {}
