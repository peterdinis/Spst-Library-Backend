import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { FindAllAuthorsDto } from './dto/find-all-authors.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { Author } from '@prisma/client';
import { AdminGuard, TeacherGuard } from 'src/permissions/guards/roles.guard';

@ApiTags('authors')
@Controller('authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  /**
   * Create a new author.
   * @param {CreateAuthorDto} createAuthorDto - The payload for creating an author.
   * @returns {Promise<Author>} The created author.
   */
  @UseGuards(TeacherGuard, AdminGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new author' })
  @ApiResponse({ status: 201, description: 'Author successfully created.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  async create(@Body() createAuthorDto: CreateAuthorDto): Promise<Author> {
    return this.authorsService.create(createAuthorDto);
  }

  /**
   * Get all authors with optional pagination and search.
   * @param {FindAllAuthorsDto} query - Pagination and search parameters.
   * @returns {Promise<{ data: Author[]; total: number }>} Authors with total count.
   */
  @Get()
  @ApiOperation({ summary: 'Get all authors with pagination and search' })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
    description: 'Number of records to skip',
  })
  @ApiQuery({
    name: 'take',
    required: false,
    type: Number,
    description: 'Number of records to return',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search authors by name, bio, or nationality',
  })
  @ApiResponse({ status: 200, description: 'List of authors retrieved.' })
  async findAll(
    @Query() query: FindAllAuthorsDto,
  ): Promise<{ data: Author[]; total: number }> {
    return this.authorsService.findAll(query);
  }

  /**
   * Get a single author by ID.
   * @param {number} id - The ID of the author.
   * @returns {Promise<Author | null>} The requested author.
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get an author by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Author ID' })
  @ApiResponse({ status: 200, description: 'Author found.' })
  @ApiResponse({ status: 404, description: 'Author not found.' })
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Author | null> {
    return this.authorsService.findOne(id);
  }

  /**
   * Update an author by ID.
   * @param {number} id - The ID of the author.
   * @param {UpdateAuthorDto} updateAuthorDto - The update payload.
   * @returns {Promise<Author>} The updated author.
   */
  @UseGuards(TeacherGuard, AdminGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update an author by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Author ID' })
  @ApiResponse({ status: 200, description: 'Author updated successfully.' })
  @ApiResponse({ status: 404, description: 'Author not found.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAuthorDto: UpdateAuthorDto,
  ): Promise<Author> {
    return this.authorsService.update(id, updateAuthorDto);
  }

  /**
   * Delete an author by ID.
   * @param {number} id - The ID of the author.
   * @returns {Promise<Author>} The deleted author.
   */
  @UseGuards(TeacherGuard, AdminGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete an author by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Author ID' })
  @ApiResponse({ status: 200, description: 'Author deleted successfully.' })
  @ApiResponse({ status: 404, description: 'Author not found.' })
  async remove(@Param('id', ParseIntPipe) id: number): Promise<Author> {
    return this.authorsService.remove(id);
  }
}
