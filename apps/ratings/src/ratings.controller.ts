import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RatingService } from './ratings.service';
import { PaginationDto } from '@app/dtos/ratings/rating-pagination.dto';
import { CreateRatingDto } from '@app/dtos/ratings/create-rating.dto';
import { UpdateRatingDto } from '@app/dtos/ratings/update-rating.dto';

@ApiTags('Ratings')
@Controller('ratings')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Get()
  @ApiOperation({ summary: 'Get all ratings (paginated)' })
  @ApiResponse({ status: 200, description: 'List of ratings with pagination' })
  findAll(@Query() pagination: PaginationDto) {
    return this.ratingService.findAll(pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a rating by ID' })
  @ApiResponse({ status: 200, description: 'Rating found' })
  @ApiResponse({ status: 404, description: 'Rating not found' })
  findOne(@Param('id') id: string) {
    return this.ratingService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new rating' })
  @ApiResponse({ status: 201, description: 'Rating created' })
  create(@Body() body: CreateRatingDto) {
    return this.ratingService.create(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a rating' })
  @ApiResponse({ status: 200, description: 'Rating updated' })
  update(@Param('id') id: string, @Body() body: UpdateRatingDto) {
    return this.ratingService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a rating' })
  @ApiResponse({ status: 200, description: 'Rating deleted' })
  remove(@Param('id') id: string) {
    return this.ratingService.remove(id);
  }
}
