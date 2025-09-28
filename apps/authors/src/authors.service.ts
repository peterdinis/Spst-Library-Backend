import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthorsService {
  getHello(): string {
    return 'Hello World!';
  }
}
