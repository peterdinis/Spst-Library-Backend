import { Controller, Get } from '@nestjs/common';
import { RatingsService } from './ratings.service';

@Controller()
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Get()
  getHello(): string {
    return this.ratingsService.getHello();
  }
}
