import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BooksModule } from 'src/books/books.module';
import { LoggingMiddleware } from 'src/shared/middleware/logging.middleware';
import { CategoriesModule } from 'src/categories/categories.module';

@Module({
  imports: [PrismaModule, BooksModule, CategoriesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
