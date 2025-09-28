import { Module } from '@nestjs/common';
import { AuthorsController } from './authors.controller';
import { AuthorsService } from './authors.service';

@Module({
  imports: [],
  controllers: [AuthorsController],
  providers: [AuthorsService],
})
export class AuthorsModule {}
