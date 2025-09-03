import { CacheModule } from '@nestjs/cache-manager';
import { Module, Global } from '@nestjs/common';
import * as redisStore from 'cache-manager-ioredis';

@Global()
@Module({})
export class GlobalCacheModule {
  static forRootAsync() {
    return CacheModule.registerAsync({
      isGlobal: true,
      useFactory: () => ({
        store: redisStore,
        host: process.env.REDIS_HOST,
        port: 6379,
        ttl: 60,
      }),
    });
  }
}