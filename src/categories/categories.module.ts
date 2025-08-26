import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CategoryService } from './categories.service';
import { CategoryController } from './categories.controller';
import { CacheModule } from 'src/cache/cache.module';

@Module({
  imports: [PrismaModule, CacheModule],
  providers: [CategoryService],
  controllers: [CategoryController],
})
export class CategoriesModule {}
