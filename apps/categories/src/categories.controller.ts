import { CategoriesPaginationDto } from '@app/dtos/categories/categories-pagination.dto';
import { CreateCategoryDto } from '@app/dtos/categories/create-category.dto';
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CategoryService } from './categories.service';
import { UpdateCategoryDto } from '@app/dtos/categories/update-categories.dto';

@ApiTags('Categories')
@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @ApiOperation({ summary: 'Get all categories (paginated + search)' })
  findAll(@Query() pagination: CategoriesPaginationDto) {
    return this.categoryService.findAll(pagination);
  }

  @Get('all')
  @ApiOperation({
    summary: 'Get all categories (cached, no pagination or search)',
  })
  findAllCached() {
    return this.categoryService.findAllCached();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a category by ID' })
  @ApiResponse({ status: 404, description: 'Category not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new category' })
  create(@Body() body: CreateCategoryDto) {
    return this.categoryService.create(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a category' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateCategoryDto,
  ) {
    return this.categoryService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a category' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.categoryService.remove(id);
  }
}
