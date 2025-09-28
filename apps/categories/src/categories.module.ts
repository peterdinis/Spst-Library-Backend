import { Module } from '@nestjs/common';
import { DatabaseModule } from '@app/common';
import { CategoryController } from './categories.controller';
import { CategoryService } from './categories.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Category, CategorySchema } from './model/category.model';

@Module({
  imports: [DatabaseModule, MongooseModule.forFeature([{ name: Category.name, schema: CategorySchema }]),],
  controllers: [CategoryController],
  providers: [CategoryService],
})
export class CategoriesModule {}
