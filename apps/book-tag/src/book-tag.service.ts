import { Injectable } from '@nestjs/common';

@Injectable()
export class BookTagService {
  getHello(): string {
    return 'Hello World!';
  }
}
