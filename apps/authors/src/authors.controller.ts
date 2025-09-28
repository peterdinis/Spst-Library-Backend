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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { CreateAuthorDto } from '@app/dtos/authors/create-author.dto';
import { QueryAuthorDto } from '@app/dtos/authors/query-author.dto';
import { UpdateAuthorDto } from '@app/dtos/authors/update-author.dto';

@ApiTags('authors')
@Controller('authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new author' })
  @ApiResponse({ status: 201, description: 'Author successfully created.' })
  @ApiBadRequestResponse({ description: 'Invalid input data.' })
  @ApiConflictResponse({ description: 'Duplicate author detected.' })
  create(@Body() dto: CreateAuthorDto) {
    return this.authorsService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get a paginated list of authors with optional search',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search by author name',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  @ApiResponse({ status: 200, description: 'Paginated list of authors.' })
  @ApiBadRequestResponse({ description: 'Invalid pagination values.' })
  @ApiNotFoundResponse({ description: 'No authors found.' })
  findAll(@Query() query: QueryAuthorDto) {
    return this.authorsService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an author by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Author ID' })
  @ApiResponse({ status: 200, description: 'Author found.' })
  @ApiNotFoundResponse({ description: 'Author not found.' })
  @ApiBadRequestResponse({ description: 'Invalid author ID.' })
  findOne(@Param('id') id: string) {
    return this.authorsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing author' })
  @ApiParam({ name: 'id', type: Number, description: 'Author ID' })
  @ApiResponse({ status: 200, description: 'Author successfully updated.' })
  @ApiNotFoundResponse({ description: 'Author not found.' })
  @ApiBadRequestResponse({ description: 'Invalid author ID or data.' })
  @ApiConflictResponse({ description: 'Duplicate author data conflict.' })
  update(@Param('id') id: string, @Body() dto: UpdateAuthorDto) {
    return this.authorsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an author by ID' })
  @ApiParam({ name: 'id', type: Number, description: 'Author ID' })
  @ApiResponse({ status: 200, description: 'Author successfully deleted.' })
  @ApiNotFoundResponse({ description: 'Author not found.' })
  @ApiBadRequestResponse({ description: 'Invalid author ID.' })
  remove(@Param('id') id: string) {
    return this.authorsService.remove(id);
  }
}
