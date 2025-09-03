import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BookTagModule } from 'src/book-tag/book-tag.module';
import { RatingModule } from 'src/rating/rating.module';
import { CategoryModule } from 'src/category/category.module';
import { AuthorsModule } from 'src/authors/authors.module';
import { GlobalCacheModule } from 'src/cache/global.cache.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    GlobalCacheModule.forRootAsync(),
    PrismaModule,
    BookTagModule,
    RatingModule,
    CategoryModule,
    AuthorsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
