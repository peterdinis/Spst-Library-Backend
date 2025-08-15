import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Patch,
    Delete,
    Query,
    ParseIntPipe,
} from '@nestjs/common';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { FilterBooksDto } from './dto/filtering-books.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';

@ApiTags('books')
@Controller('books')
export class BooksController {
    constructor(private readonly booksService: BooksService) { }

    @ApiOperation({ summary: 'Get all books with pagination' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'search', required: false, type: String })
    @Get('paginate')
    async paginate(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('search') search?: string,
    ) {
        return this.booksService.paginate(page || 1, limit || 10, search);
    }

    @ApiOperation({ summary: 'Create a new book' })
    @ApiBody({ type: CreateBookDto })
    @ApiResponse({ status: 201, description: 'Book created' })
    @Post()
    async create(@Body() createBookDto: CreateBookDto) {
        return this.booksService.create(createBookDto);
    }

    @ApiOperation({ summary: 'Get all books' })
    @ApiResponse({ status: 200, description: 'List of books' })
    @Get()
    async findAll() {
        return this.booksService.findAll();
    }

    @ApiOperation({ summary: 'Get book by ID' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'Book details' })
    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.booksService.findOne(id);
    }

    @ApiOperation({ summary: 'Update book by ID' })
    @ApiParam({ name: 'id', type: Number })
    @ApiBody({ type: UpdateBookDto })
    @ApiResponse({ status: 200, description: 'Book updated' })
    @Patch(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateBookDto: UpdateBookDto,
    ) {
        return this.booksService.update(id, updateBookDto);
    }

    @ApiOperation({ summary: 'Delete book by ID' })
    @ApiParam({ name: 'id', type: Number })
    @ApiResponse({ status: 200, description: 'Book deleted' })
    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        return this.booksService.remove(id);
    }

    @ApiOperation({ summary: 'Search books' })
    @ApiQuery({ name: 'query', type: String })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @Get('search')
    async search(
        @Query('query') query: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number,
    ) {
        return this.booksService.search(query, page || 1, limit || 10);
    }

    @ApiOperation({ summary: 'Filter books' })
    @ApiBody({ type: FilterBooksDto })
    @Post('filter')
    async filter(@Body() filterDto: FilterBooksDto) {
        return this.booksService.filterBooks(filterDto);
    }

    @ApiOperation({ summary: 'Get available books' })
    @Get('available')
    async findAvailable() {
        return this.booksService.findAvailable();
    }

    @ApiOperation({ summary: 'Get unavailable books' })
    @Get('unavailable')
    async findUnavailable() {
        return this.booksService.findUnavailable();
    }

    @ApiOperation({ summary: 'Update book availability' })
    @ApiParam({ name: 'id', type: Number })
    @ApiQuery({ name: 'isAvailable', type: Boolean })
    @Patch(':id/availability')
    async updateAvailability(
        @Param('id', ParseIntPipe) id: number,
        @Query('isAvailable') isAvailable: boolean,
    ) {
        return this.booksService.updateAvailability(id, isAvailable);
    }
}
