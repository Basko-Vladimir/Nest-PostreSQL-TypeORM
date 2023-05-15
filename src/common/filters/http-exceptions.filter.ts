import { Response } from 'express';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch(HttpException)
export class HttpExceptionsFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const errorStatus = exception.getStatus();
    const errorResponseBody: any = exception.getResponse();

    if (errorStatus === HttpStatus.BAD_REQUEST) {
      const result = { errorsMessages: errorResponseBody.message };
      response.status(errorStatus).send(result);
      return;
    }

    response.status(errorStatus).json({
      statusCode: errorStatus,
      message: errorResponseBody.message,
    });
  }
}
