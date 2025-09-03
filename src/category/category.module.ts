import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import * as redisStore from 'cache-manager-ioredis';
import { CategorytService } from './category.service';
import { CategoryController } from './category.controller';

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
  providers: [CategorytService],
  exports: [CategoryController],
})
export class CategoryModule {}
