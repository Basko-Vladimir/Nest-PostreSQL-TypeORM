import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { INTERNAL_SERVER_ERROR } from '../error-messages';

@Catch(Error)
export class ServerErrorsFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    let result: any = INTERNAL_SERVER_ERROR;

    // if (process.env.NODE_ENV !== 'production') {
    result = {
      error: exception.toString(),
      stack: exception.stack,
    };
    // }
    console.log(exception);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(result);
  }
}
