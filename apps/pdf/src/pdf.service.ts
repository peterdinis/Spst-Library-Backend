import { Injectable } from '@nestjs/common';

@Injectable()
export class PdfService {
  getHello(): string {
    return 'Hello World!';
  }
}
