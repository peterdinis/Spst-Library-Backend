import { Module } from '@nestjs/common';
import { BooksModule } from 'apps/books/src/books.module';
import { CategoriesModule } from 'apps/categories/src/categories.module';

@Module({
  imports: [BooksModule, CategoriesModule],
})
export class AppModule {}
