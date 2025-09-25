import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
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
  async create(dto: CreateAuthorSuggestionDto) {
    if (!dto.name || !dto.litPeriod || !dto.bornDate) {
      throw new BadRequestException(
        'Missing required fields: name, litPeriod, bornDate',
      );
    }

    if (dto.suggestedByName) {
      throw new BadRequestException(
        'Non-authenticated users must provide suggestedByName',
      );
    }

    return this.prisma.authorSuggestion.create({
      data: {
        name: dto.name,
        bio: dto.bio,
        litPeriod: dto.litPeriod,
        authorImage: dto.authorImage,
        bornDate: dto.bornDate,
        deathDate: dto.deathDate,
        suggestedByName: dto.suggestedByName,
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

    if (!isAdmin) {
      throw new ForbiddenException(
        'You do not have permission to delete this suggestion',
      );
    }

    return this.prisma.authorSuggestion.delete({
      where: { id },
    });
  }

  async approveSuggestion(id: number) {
    // Find the suggestion
    const suggestion = await this.prisma.authorSuggestion.findUnique({
      where: { id },
    });

    if (!suggestion) {
      throw new NotFoundException('Author suggestion not found');
    }

    if (suggestion.status !== SuggestionStatus.PENDING) {
      throw new BadRequestException('Only PENDING suggestions can be approved');
    }

    // Update the suggestion status to APPROVED
    await this.prisma.authorSuggestion.update({
      where: { id },
      data: { status: SuggestionStatus.APPROVED },
    });

    // Create a new author based on the suggestion
    const newAuthor = await this.prisma.author.create({
      data: {
        name: suggestion.name,
        bio: suggestion.bio,
        litPeriod: suggestion.litPeriod,
        authorImage: suggestion.authorImage,
        bornDate: suggestion.bornDate,
        deathDate: suggestion.deathDate,
      },
    });

    return newAuthor;
  }

  async rejectSuggestion(id: number) {
    const suggestion = await this.prisma.authorSuggestion.findUnique({
      where: { id },
    });

    if (!suggestion) {
      throw new NotFoundException('Author suggestion not found');
    }

    if (suggestion.status !== SuggestionStatus.PENDING) {
      throw new BadRequestException('Only PENDING suggestions can be rejected');
    }

    return this.prisma.authorSuggestion.update({
      where: { id },
      data: { status: SuggestionStatus.REJECTED },
    });
  }
}
