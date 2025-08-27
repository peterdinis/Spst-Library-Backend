import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BooksModule } from 'src/books/books.module';
import { LoggingMiddleware } from 'src/shared/middleware/logging.middleware';
import { CategoriesModule } from 'src/categories/categories.module';
import { ConfigModule } from '@nestjs/config';
import { EmailsModule } from '../emails/emails.module';
import { AuthorsModule } from 'src/authors/authors.module';
import { StudentsModule } from 'src/students/students.module';
import { TeachersModule } from 'src/teachers/teachers.module';
import { OrdersModule } from 'src/orders/orders.module';
import { CacheModule } from '@nestjs/cache-manager';


@Module({
  imports: [
    PrismaModule,
    AuthorsModule,
    BooksModule,
    EmailsModule,
    CategoriesModule,
    CacheModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    StudentsModule,
    TeachersModule,
    OrdersModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
