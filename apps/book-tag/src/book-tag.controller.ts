import { Controller, Get } from '@nestjs/common';
import { BookTagService } from './book-tag.service';

@Controller()
export class BookTagController {
  constructor(private readonly bookTagService: BookTagService) {}

  @Get()
  getHello(): string {
    return this.bookTagService.getHello();
  }
}
