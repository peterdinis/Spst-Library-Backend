import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateAuthorSuggestionDto } from './dto/create-author-suggestion.dto';
import { SuggestionStatus } from '@prisma/client';

@Injectable()
export class AuthorSuggestionService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new author suggestion.
   * Non-authenticated users can also create suggestions by providing suggestedByName.
   */
  async create(dto: CreateAuthorSuggestionDto, userId?: number) {
    if (!dto.name || !dto.litPeriod || !dto.bornDate) {
      throw new BadRequestException('Missing required fields: name, litPeriod, bornDate');
    }

    if (!userId && !dto.suggestedByName) {
      throw new BadRequestException('Non-authenticated users must provide suggestedByName');
    }

    return this.prisma.authorSuggestion.create({
      data: {
        name: dto.name,
        bio: dto.bio,
        litPeriod: dto.litPeriod,
        authorImage: dto.authorImage,
        bornDate: dto.bornDate,
        deathDate: dto.deathDate,
        suggestedById: userId ?? null,
        suggestedByName: userId ? null : dto.suggestedByName,
        status: SuggestionStatus.PENDING,
      },
    });
  }

  /**
   * Update status of a suggestion. Only PENDING suggestions can be updated.
   */
  async updateStatus(id: number, status: 'APPROVED' | 'REJECTED') {
    const suggestion = await this.prisma.authorSuggestion.findUnique({
      where: { id },
    });

    if (!suggestion) {
      throw new NotFoundException('Author suggestion not found');
    }

    if (suggestion.status !== SuggestionStatus.PENDING) {
      throw new BadRequestException('Only PENDING suggestions can be updated');
    }

    return this.prisma.authorSuggestion.update({
      where: { id },
      data: { status },
    });
  }

  /**
   * Get all suggestions, optionally filtered by status.
   */
  async findAll(status?: SuggestionStatus) {
    const whereClause = status ? { status } : {};
    return this.prisma.authorSuggestion.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get a single suggestion by id.
   */
  async findOne(id: number) {
    const suggestion = await this.prisma.authorSuggestion.findUnique({
      where: { id },
    });

    if (!suggestion) {
      throw new NotFoundException('Author suggestion not found');
    }

    return suggestion;
  }

  /**
   * Delete a suggestion. Only admin or the creator can delete.
   */
  async remove(id: number, userId?: number, isAdmin = false) {
    const suggestion = await this.prisma.authorSuggestion.findUnique({
      where: { id },
    });

    if (!suggestion) {
      throw new NotFoundException('Author suggestion not found');
    }

    if (!isAdmin && suggestion.suggestedById !== userId) {
      throw new ForbiddenException('You do not have permission to delete this suggestion');
    }

    return this.prisma.authorSuggestion.delete({
      where: { id },
    });
  }
}
