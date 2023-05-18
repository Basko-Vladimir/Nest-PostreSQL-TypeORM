import { CookieOptions } from 'express';
import { SortDirection } from './enums';

export interface UpdateOrFilterModel<T = unknown> {
  [key: string]: T;
}

export interface AllEntitiesOutputModel<T> {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: T[];
}

export interface ICommonQueryParams {
  sortDirection: SortDirection;
  pageNumber: number;
  pageSize: number;
}

export interface IErrorOutputModel {
  message: string;
  field: string;
}

export interface IEmailInfoModel {
  from: string;
  to: string;
  subject: string;
  html: string;
}

export interface ITokensData {
  accessToken: string;
  refreshToken: string;
  refreshTokenSettings: CookieOptions;
}

export interface ICommonInfoForQueryAllRequests {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
}
