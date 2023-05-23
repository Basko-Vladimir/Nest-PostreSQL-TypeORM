import fs from 'fs';
import { Request } from 'express';
import {
  BadRequestException,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { validateOrReject } from 'class-validator';
import { SortDirection } from './enums';
import { ICommonInfoForQueryAllRequests } from './types';

export const countSkipValue = (
  pageNumber: number,
  pageSize: number,
): number => {
  return (pageNumber - 1) * pageSize;
};

export const validateOrRejectInputDto = async (
  dto: object,
  classConstructor: { new (): object },
): Promise<void> => {
  if (!(dto instanceof classConstructor)) {
    throw new Error('Incorrect input data!');
  }

  try {
    await validateOrReject(dto);
  } catch (error) {
    throw new Error(error);
  }
};

export const makeCapitalizeString = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const generateCustomBadRequestException = (
  message: string,
  field: string,
): never => {
  throw new BadRequestException([{ message, field }]);
};

export const getAuthHeaderValue = (context: ExecutionContext): string => {
  const request: Request = context.switchToHttp().getRequest();
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    throw new UnauthorizedException();
  }

  return authHeader.split(' ')[1];
};

export const getCommonInfoForQueryAllRequests = (
  totalCount: number | string,
  pageSize: number | string,
  pageNumber: number | string,
): ICommonInfoForQueryAllRequests => {
  if (typeof totalCount !== 'number') {
    totalCount = Number(totalCount);
  }
  if (typeof pageSize !== 'number') {
    pageSize = Number(pageSize);
  }
  if (typeof pageNumber !== 'number') {
    pageNumber = Number(pageNumber);
  }

  return {
    pagesCount: Math.ceil(totalCount / pageSize),
    page: pageNumber,
    pageSize,
    totalCount,
  };
};

export const getDbSortDirection = (sortDirection: SortDirection) => {
  return sortDirection === SortDirection.asc ? 'ASC' : 'DESC';
};

export const writeLogToFile = async (content: string): Promise<void> => {
  return fs.writeFile('logs.txt', content, {}, (err) => {
    console.log(err);
  });
};
