import { NestFactory } from '@nestjs/core';
import { AuthorSuggestionModule } from './author-suggestion.module';

async function bootstrap() {
  const app = await NestFactory.create(AuthorSuggestionModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
