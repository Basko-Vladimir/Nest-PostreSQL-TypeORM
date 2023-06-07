export enum SortDirection {
  desc = 'desc',
  asc = 'asc',
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
  QUIZ_QUESTION_ID = 'quizQuestionId',
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
