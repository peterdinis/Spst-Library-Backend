import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BooksModule } from 'src/books/books.module';
import { LoggingMiddleware } from 'src/shared/middleware/logging.middleware';
import { CategoriesModule } from 'src/categories/categories.module';
import { ConfigModule } from '@nestjs/config';
import { EmailsModule } from '../emails/emails.module';
import { AuthorsModule } from 'src/authors/authors.module';
import { StudentsModule } from 'src/students/students.module';
import { TeachersModule } from 'src/teachers/teachers.module';

@Module({
  imports: [
    PrismaModule,
    AuthorsModule,
    BooksModule,
    EmailsModule,
    CategoriesModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    StudentsModule,
    TeachersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
