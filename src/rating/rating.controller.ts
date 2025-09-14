import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RatingService } from './rating.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { PaginationDto } from './dto/rating-pagination.dto';
import { UpdateRatingDto } from './dto/update-rating.dto';
import { ArcjetGuard} from '@arcjet/nest';

@ApiTags('Ratings')
@Controller('ratings')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @Get()
  @UseGuards(ArcjetGuard)
  @ApiOperation({ summary: 'Get all ratings (paginated)' })
  @ApiResponse({ status: 200, description: 'List of ratings with pagination' })
  findAll(@Query() pagination: PaginationDto) {
    return this.ratingService.findAll(pagination);
  }

  @Get(':id')
  @UseGuards(ArcjetGuard)
  @ApiOperation({ summary: 'Get a rating by ID' })
  @ApiResponse({ status: 200, description: 'Rating found' })
  @ApiResponse({ status: 404, description: 'Rating not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.ratingService.findOne(id);
  }

  @Post()
  @UseGuards(ArcjetGuard)
  @ApiOperation({ summary: 'Create a new rating' })
  @ApiResponse({ status: 201, description: 'Rating created' })
  create(@Body() body: CreateRatingDto) {
    return this.ratingService.create(body);
  }

  @Patch(':id')
  @UseGuards(ArcjetGuard)
  @ApiOperation({ summary: 'Update a rating' })
  @ApiResponse({ status: 200, description: 'Rating updated' })
  update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateRatingDto) {
    return this.ratingService.update(id, body);
  }

  @Delete(':id')
  @UseGuards(ArcjetGuard)
  @ApiOperation({ summary: 'Delete a rating' })
  @ApiResponse({ status: 200, description: 'Rating deleted' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.ratingService.remove(id);
  }
}
