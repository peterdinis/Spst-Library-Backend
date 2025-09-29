import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
  Patch,
  Param,
  Get,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CreateAuthorSuggestionDto } from '@app/dtos';
import { AuthorSuggestionService } from './author-suggestion.service';

@ApiTags('Author Suggestions')
@Controller('author-suggestions')
export class AuthorSuggestionController {
  constructor(private service: AuthorSuggestionService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({
    summary: 'Suggest a new author (available for non-logged-in users as well)',
  })
  @ApiResponse({
    status: 201,
    description: 'Author suggestion successfully created',
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async create(@Body() dto: CreateAuthorSuggestionDto) {
    return this.service.create(dto);
  }

  @Patch(':id/status')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Approve or reject an author suggestion (admin only)',
  })
  @ApiResponse({ status: 200, description: 'Suggestion status updated' })
  @ApiResponse({ status: 403, description: 'Unauthorized' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: any, // TODO: Fix me later
  ) {
    return this.service.updateStatus(id, dto.status);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all author suggestions (admin only)' })
  @ApiResponse({ status: 200, description: 'List of author suggestions' })
  async findAll() {
    return this.service.findAll();
  }
}
