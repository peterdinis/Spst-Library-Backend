import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { format } from 'date-fns';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();

    res.on('finish', () => {
      const duration = (Date.now() - start) / 1000;
      const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');

      console.log(
        `[${timestamp}] ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration.toFixed(3)}s`
      );
    });

    next();
  }
}
