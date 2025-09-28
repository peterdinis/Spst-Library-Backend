import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AuthorSuggestion, AuthorSuggestionDocument, SuggestionStatus } from './model/author-suggestion.model';
import { Author, AuthorDocument } from 'apps/authors/src/models/author.model';
import { CreateAuthorSuggestionDto } from '@app/dtos';

@Injectable()
export class AuthorSuggestionService {
  constructor(
    @InjectModel(AuthorSuggestion.name) private suggestionModel: Model<AuthorSuggestionDocument>,
    @InjectModel(Author.name) private authorModel: Model<AuthorDocument>,
  ) {}

  async create(dto: CreateAuthorSuggestionDto): Promise<AuthorSuggestion> {
    if (!dto.name || !dto.litPeriod || !dto.bornDate) {
      throw new BadRequestException(
        'Missing required fields: name, litPeriod, bornDate',
      );
    }

    if (!dto.suggestedByName) {
      throw new BadRequestException(
        'Non-authenticated users must provide suggestedByName',
      );
    }

    const suggestion = new this.suggestionModel({
      ...dto,
      status: SuggestionStatus.PENDING,
    });

    return suggestion.save();
  }

  async updateStatus(
    id: string,
    status: SuggestionStatus.APPROVED | SuggestionStatus.REJECTED,
  ): Promise<AuthorSuggestion> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid suggestion ID');
    }

    const suggestion = await this.suggestionModel.findById(id).exec();
    if (!suggestion) throw new NotFoundException('Author suggestion not found');
    if (suggestion.status !== SuggestionStatus.PENDING) {
      throw new BadRequestException('Only PENDING suggestions can be updated');
    }

    suggestion.status = status;
    return suggestion.save();
  }

  async findAll(status?: SuggestionStatus): Promise<AuthorSuggestion[]> {
    const filter = status ? { status } : {};
    return this.suggestionModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<AuthorSuggestion> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid suggestion ID');
    }

    const suggestion = await this.suggestionModel.findById(id).exec();
    if (!suggestion) throw new NotFoundException('Author suggestion not found');
    return suggestion;
  }

  async remove(id: string, isAdmin = false): Promise<{ message: string }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid suggestion ID');
    }

    const suggestion = await this.suggestionModel.findById(id).exec();
    if (!suggestion) throw new NotFoundException('Author suggestion not found');

    if (!isAdmin) {
      throw new ForbiddenException(
        'You do not have permission to delete this suggestion',
      );
    }

    await this.suggestionModel.findByIdAndDelete(id).exec();
    return { message: `Author suggestion ${id} deleted successfully.` };
  }

  async approveSuggestion(id: string): Promise<Author> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid suggestion ID');
    }

    const suggestion = await this.suggestionModel.findById(id).exec();
    if (!suggestion) throw new NotFoundException('Author suggestion not found');
    if (suggestion.status !== SuggestionStatus.PENDING) {
      throw new BadRequestException('Only PENDING suggestions can be approved');
    }

    // Update suggestion status
    suggestion.status = SuggestionStatus.APPROVED;
    await suggestion.save();

    // Create new author
    const newAuthor = new this.authorModel({
      name: suggestion.name,
      bio: suggestion.bio,
      litPeriod: suggestion.litPeriod,
      authorImage: suggestion.authorImage,
      bornDate: suggestion.bornDate,
      deathDate: suggestion.deathDate,
    });

    return newAuthor.save();
  }

  async rejectSuggestion(id: string): Promise<AuthorSuggestion> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid suggestion ID');
    }

    const suggestion = await this.suggestionModel.findById(id).exec();
    if (!suggestion) throw new NotFoundException('Author suggestion not found');
    if (suggestion.status !== SuggestionStatus.PENDING) {
      throw new BadRequestException('Only PENDING suggestions can be rejected');
    }

    suggestion.status = SuggestionStatus.REJECTED;
    return suggestion.save();
  }
}
