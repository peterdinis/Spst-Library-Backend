import { Injectable } from '@nestjs/common';

@Injectable()
export class RatingsService {
  getHello(): string {
    return 'Hello World!';
  }
}
