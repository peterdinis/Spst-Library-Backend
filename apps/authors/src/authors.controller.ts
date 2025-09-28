import { Controller, Get } from '@nestjs/common';
import { AuthorsService } from './authors.service';

@Controller()
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Get()
  getHello(): string {
    return this.authorsService.getHello();
  }
}
