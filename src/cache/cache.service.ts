import { Injectable } from '@nestjs/common';
import Keyv from 'keyv';
import KeyvRedis from '@keyv/redis';

@Injectable()
export class CacheService {
  private cache = new Keyv({ store: new KeyvRedis('redis://localhost:6379') });

  async get<T>(key: string): Promise<T | null> {
    return this.cache.get(key) as Promise<T | null>;
  }

  async set(key: string, value: any, ttl?: number) {
    await this.cache.set(key, value, ttl);
  }

  async delete(key: string) {
    await this.cache.delete(key);
  }

  async reset() {
    await this.cache.clear();
  }
}
