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
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { QueryBooksDto } from './dto/query-book.dto';
import { FilterBooksDto } from './dto/filter-books.dto';

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
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by name or description',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Books retrieved successfully' })
  @ApiResponse({ status: 404, description: 'No books found' })
  findAll(@Query() query: QueryBooksDto) {
    return this.booksService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a book by ID' })
  @ApiResponse({ status: 200, description: 'Book retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Invalid ID' })
  @ApiResponse({ status: 404, description: 'Book not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a book by ID' })
  @ApiResponse({ status: 200, description: 'Book updated successfully' })
  @ApiResponse({ status: 400, description: 'Validation failed or invalid ID' })
  @ApiResponse({ status: 404, description: 'Book not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBookDto: UpdateBookDto,
  ) {
    return this.booksService.update(id, updateBookDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a book by ID' })
  @ApiResponse({ status: 200, description: 'Book deleted successfully' })
  @ApiResponse({ status: 404, description: 'Book not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.remove(id);
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
}
