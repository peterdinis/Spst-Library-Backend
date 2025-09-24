import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthorSuggestionService } from './authors-suggestion.service';
import { AuthorSuggestionController } from './authors-suggestion.controller';

@Module({
  imports: [PrismaModule],
  providers: [AuthorSuggestionService],
  controllers: [AuthorSuggestionController],
  exports: [AuthorSuggestionService],
})
export class AuthorsSuggestion {}
