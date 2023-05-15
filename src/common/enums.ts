export enum SortDirection {
  desc = 'desc',
  asc = 'asc',
}

export const enum DbSortDirection {
  ASC = 1,
  DESC = -1,
}

export enum BlogSortByField {
  name = 'name',
  websiteUrl = 'websiteUrl',
  createdAt = 'createdAt',
}

export enum PostSortByField {
  createdAt = 'createdAt',
  title = 'title',
  blogName = 'blogName',
  shortDescription = 'shortDescription',
  content = 'content',
}

export enum UserSortByField {
  login = 'login',
  email = 'email',
  createdAt = 'createdAt',
}

export enum CommentSortByField {
  content = 'content',
  // userLogin = 'userLogin', // This field doesn't exist in SQL comment table
  createdAt = 'createdAt',
}

export enum ClientRequestSortByField {
  endpoint = 'endpoint',
  ip = 'ip',
  createTimeStamp = 'createTimeStamp',
}

export enum LikeStatus {
  NONE = 'None',
  LIKE = 'Like',
  DISLIKE = 'Dislike',
}

export enum AuthType {
  BASIC = 'basic',
  BEARER = 'bearer',
}

export enum IdTypes {
  BLOG_ID = 'blogId',
  POST_ID = 'postId',
  USER_ID = 'userId',
  COMMENT_ID = 'commentId',
}

export enum BanStatus {
  ALL = 'all',
  BANNED = 'banned',
  NOT_BANNED = 'notBanned',
}

export enum Roles {
  ADMIN = 'admin',
  BLOGGER = 'blogger',
  PUBLIC_USER = 'user',
}
