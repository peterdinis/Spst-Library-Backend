import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-ioredis';
import { GlobalCacheModule } from '../global.cache.module';

jest.mock('@nestjs/cache-manager', () => ({
  CacheModule: {
    registerAsync: jest.fn(),
  },
}));

describe('GlobalCacheModule', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call CacheModule.registerAsync with correct options', () => {
    const spyRegisterAsync = jest.spyOn(CacheModule, 'registerAsync');

    GlobalCacheModule.forRootAsync();

    expect(spyRegisterAsync).toHaveBeenCalled();

    const firstCall = spyRegisterAsync.mock.calls[0]?.[0];
    expect(firstCall).toBeDefined();

    if (firstCall) {
      expect(firstCall.isGlobal).toBe(true);
      expect(firstCall.useFactory).toBeInstanceOf(Function);

      const config = firstCall.useFactory?.();
      expect(config).toMatchObject({
        store: redisStore,
        host: process.env.REDIS_HOST,
        port: 6379,
        ttl: 60,
      });
    }
  });
});
