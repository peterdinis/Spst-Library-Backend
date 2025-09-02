import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BookTagController } from './book-tag.controller';
import { BookTagService } from './book-tag.service';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-ioredis';

@Module({
  imports: [
    PrismaModule,
    CacheModule.registerAsync({
      useFactory: () => ({
        store: redisStore,
        host: process.env.REDIS_HOST,
        port: 6379,
        ttl: 60,
      }),
    }),
  ],
  controllers: [BookTagController],
  providers: [BookTagService],
})
export class BookTagModule {}
