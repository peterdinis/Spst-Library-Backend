import { NestFactory } from '@nestjs/core';
import { RatingsModule } from './ratings.module';

async function bootstrap() {
  const app = await NestFactory.create(RatingsModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
