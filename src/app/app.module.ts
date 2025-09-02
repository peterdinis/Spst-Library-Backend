import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-ioredis';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BookTagModule } from 'src/book-tag/book-tag.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    CacheModule.registerAsync({
      useFactory: () => ({
        store: redisStore,
        host: process.env.REDIS_HOST,
        port: 6379,
        ttl: 60,
      }),
    }),
    PrismaModule,
    BookTagModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
