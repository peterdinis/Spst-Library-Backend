import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-ioredis';
import { RatingService } from './rating.service';
import { RatingController } from './rating.controller';

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
  providers: [RatingService],
  controllers: [RatingController]
})
export class RatingModule {}
