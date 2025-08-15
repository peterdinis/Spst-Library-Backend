import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { formatISO } from 'date-fns';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const log = {
      timestamp: formatISO(new Date()),
      path: request.originalUrl,
      method: request.method,
      ip: request.ip,
      message,
      status,
    };

    console.error(log);

    response.status(status).json({
      timestamp: log.timestamp,
      path: log.path,
      method: log.method,
      status: log.status,
      error: message,
    });
  }
}
