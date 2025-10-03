import { DatabaseModule } from '@app/common';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthorSuggestionModule } from 'apps/author-suggestion/src/author-suggestion.module';
import { AuthorsModule } from 'apps/authors/src/authors.module';
import { BookTagModule } from 'apps/book-tag/src/book-tag.module';
import { BooksModule } from 'apps/books/src/books.module';
import { CategoriesModule } from 'apps/categories/src/categories.module';
import { NotificationsModule } from 'apps/notifications/src/notifications.module';
import { PdfModule } from 'apps/pdf/src/pdf.module';
import { RatingsModule } from 'apps/ratings/src/ratings.module';
import { MessagesModule } from 'libs/messages/messages.module';

@Module({
  imports: [
    DatabaseModule,
    BooksModule,
    CategoriesModule,
    AuthorsModule,
    AuthorSuggestionModule,
    NotificationsModule,
    BookTagModule,
    RatingsModule,
    PdfModule,
    MessagesModule,
    ThrottlerModule.forRoot([
      {
        limit: 10,
        ttl: 60,
        name: 'short',
      },
    ]),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
