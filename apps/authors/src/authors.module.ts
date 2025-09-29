import { Module } from '@nestjs/common';
import { AuthorsController } from './authors.controller';
import { AuthorsService } from './authors.service';
import { DatabaseModule } from '@app/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Author, AuthorSchema } from './models/author.model';

@Module({
  imports: [DatabaseModule,
    MongooseModule.forFeature([
      {
        name: Author.name, schema: AuthorSchema
      }
    ])
  ],
  controllers: [AuthorsController],
  providers: [AuthorsService],
})
export class AuthorsModule {}
