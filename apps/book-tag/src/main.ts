import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { BookTagModule } from './book-tag.module';

async function bootstrap() {
  const app = await NestFactory.create(BookTagModule);
  app.enableCors();
  const config = new DocumentBuilder()
    .setTitle('SPŠT API Documentation Book Tags')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);

  await app.listen(process.env.PORT ?? 5003);
}
bootstrap();
