import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { BookTagService } from './book-tag.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Book Tags')
@Controller('book-tag')
export class BookTagController {
  constructor(private readonly bookTagService: BookTagService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new book tag' })
  @ApiResponse({ status: 201, description: 'Book tag created successfully' })
  @ApiResponse({
    status: 400,
    description: 'Tag with this name already exists',
  })
  create(@Body('name') name: string) {
    return this.bookTagService.create(name);
  }

  @Get()
  @ApiOperation({ summary: 'Get all book tags' })
  @ApiResponse({ status: 200, description: 'List of book tags returned' })
  findAll() {
    return this.bookTagService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a book tag by ID' })
  @ApiResponse({ status: 200, description: 'Book tag found' })
  @ApiResponse({ status: 404, description: 'Book tag not found' })
  findOne(@Param('id') id: string) {
    return this.bookTagService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a book tag by ID' })
  @ApiResponse({ status: 200, description: 'Book tag updated successfully' })
  @ApiResponse({ status: 404, description: 'Book tag not found' })
  update(@Param('id') id: string, @Body('name') name?: string) {
    return this.bookTagService.update(id, name);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a book tag by ID' })
  @ApiResponse({ status: 200, description: 'Book tag deleted successfully' })
  @ApiResponse({ status: 404, description: 'Book tag not found' })
  remove(@Param('id') id: string) {
    return this.bookTagService.remove(id);
  }

  @Get('search/query')
  @ApiOperation({ summary: 'Search book tags by query' })
  @ApiResponse({ status: 200, description: 'Matching tags returned' })
  @ApiResponse({ status: 400, description: 'Search query cannot be empty' })
  search(@Query('q') query: string) {
    return this.bookTagService.search(query);
  }
}
