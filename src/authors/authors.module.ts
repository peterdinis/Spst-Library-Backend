import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    CacheModule.register({
      ttl: 60, // default cache time-to-live (in seconds)
      max: 100, // max items (if in-memory)
    }),
  ],
})
export class AuthorsModule {}
