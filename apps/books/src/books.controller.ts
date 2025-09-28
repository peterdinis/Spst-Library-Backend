import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Put,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { CreateBookDto, UpdateBookDto, FilterBooksDto } from '@app/dtos';
import { BooksService } from './books.service';

@ApiTags('books')
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new book' })
  @ApiResponse({ status: 201, description: 'Book created successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  create(@Body() createBookDto: CreateBookDto) {
    return this.booksService.create(createBookDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all books with pagination & search' })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @Query('search') search?: string,
    @Query('page', ParseIntPipe) page: number = 1,
    @Query('limit', ParseIntPipe) limit: number = 10,
  ) {
    return this.booksService.findAll({ search, page, limit });
  }

  @Get('filter/custom')
  @ApiOperation({ summary: 'Filter books by custom conditions' })
  @ApiResponse({ status: 200, description: 'Filtered books retrieved' })
  @ApiResponse({ status: 404, description: 'No books match filters' })
  filter(@Query() query: FilterBooksDto) {
    return this.booksService.filter(query);
  }

  @Get('available')
  @ApiOperation({ summary: 'Get all available books' })
  @ApiResponse({ status: 200, description: 'Available books retrieved' })
  @ApiResponse({ status: 404, description: 'No available books found' })
  findAvailable() {
    return this.booksService.findAvailable();
  }

  @Get('unavailable')
  @ApiOperation({ summary: 'Get all unavailable books' })
  @ApiResponse({ status: 200, description: 'Unavailable books retrieved' })
  @ApiResponse({ status: 404, description: 'No unavailable books found' })
  findUnavailable() {
    return this.booksService.findUnavailable();
  }

  @Get('top-rated')
  @ApiOperation({ summary: 'Get top rated books' })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of books to return',
  })
  @ApiResponse({ status: 200, description: 'Top rated books retrieved' })
  @ApiResponse({ status: 404, description: 'No top rated books found' })
  findTopRated(@Query('limit') limit?: number) {
    return this.booksService.findTopRated(limit);
  }

  @Get('recently-added')
  @ApiOperation({ summary: 'Get recently added books' })
  @ApiQuery({
    name: 'days',
    required: false,
    type: Number,
    description: 'Number of days to look back',
  })
  @ApiResponse({ status: 200, description: 'Recently added books retrieved' })
  @ApiResponse({ status: 404, description: 'No recently added books found' })
  findRecentlyAdded(@Query('days') days?: number) {
    return this.booksService.findRecentlyAdded(days);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a book by ID' })
  @ApiResponse({ status: 200, description: 'Book retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid ID' })
  @ApiResponse({ status: 404, description: 'Book not found' })
  findOne(@Param('id') id: string) {
    return this.booksService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a book by ID' })
  @ApiResponse({ status: 200, description: 'Book updated successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed or invalid ID' })
  @ApiResponse({ status: 404, description: 'Book not found' })
  update(@Param('id') id: string, @Body() updateBookDto: UpdateBookDto) {
    return this.booksService.update(id, updateBookDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a book by ID' })
  @ApiResponse({ status: 200, description: 'Book deleted successfully' })
  @ApiResponse({ status: 404, description: 'Book not found' })
  remove(@Param('id') id: string) {
    return this.booksService.remove(id);
  }
}
