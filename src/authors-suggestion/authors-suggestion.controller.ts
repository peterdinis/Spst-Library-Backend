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
import { AuthorSuggestionService } from './authors-suggestion.service';
import {
  CreateAuthorSuggestionDto,
  UpdateAuthorSuggestionStatusDto,
} from './dto/create-author-suggestion.dto';

@ApiTags('Author Suggestions')
@Controller('author-suggestions')
export class AuthorSuggestionController {
  constructor(private service: AuthorSuggestionService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({
    summary: 'Navrhnúť nového autora (aj pre nepřihláseného používateľa)',
  })
  @ApiResponse({ status: 201, description: 'Návrh autora úspešne vytvorený' })
  @ApiResponse({ status: 400, description: 'Chyba vo validácii' })
  async create(@Body() dto: CreateAuthorSuggestionDto) {
    return this.service.create(dto);
  }

  @Patch(':id/status')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Schváliť alebo zamietnuť návrh autora (admin)' })
  @ApiResponse({ status: 200, description: 'Status návrhu aktualizovaný' })
  @ApiResponse({ status: 403, description: 'Nie ste autorizovaní' })
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateAuthorSuggestionStatusDto,
  ) {
    return this.service.updateStatus(+id, dto.status);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Zobraziť všetky návrhy autorov (admin)' })
  @ApiResponse({ status: 200, description: 'Zoznam návrhov autorov' })
  async findAll() {
    return this.service.findAll();
  }
}
