import { BadRequestException, ValidationError } from '@nestjs/common';
import { IErrorOutputModel } from '../types';

export const exceptionFactory = (errors: ValidationError[]): never => {
  const errorsMessages: IErrorOutputModel[] = errors
    .map((error) => {
      return Object.keys(error.constraints).map((cKey) => {
        return {
          message: error.constraints[cKey],
          field: error.property,
        };
      });
    })
    .flat();

  throw new BadRequestException(errorsMessages);
};
