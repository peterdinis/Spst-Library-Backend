import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BooksModule } from 'src/books/books.module';
import { LoggingMiddleware } from 'src/shared/middleware/logging.middleware';
import { CategoriesModule } from 'src/categories/categories.module';
import { ConfigModule } from '@nestjs/config';
import { EmailsModule } from './emails/emails.module';

@Module({
  imports: [PrismaModule, BooksModule, EmailsModule, CategoriesModule, ConfigModule.forRoot({
    isGlobal: true,
    envFilePath: ".env"
  })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
