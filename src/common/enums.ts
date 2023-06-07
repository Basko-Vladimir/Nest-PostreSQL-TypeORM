export enum SortDirection {
  desc = 'desc',
  asc = 'asc',
}

export enum BlogSortByField {
  name = 'name',
  websiteUrl = 'websiteUrl',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
}

export enum PostSortByField {
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
  title = 'title',
  blogName = 'blogName',
  shortDescription = 'shortDescription',
  content = 'content',
}

export enum UserSortByField {
  login = 'login',
  email = 'email',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
}

export enum CommentSortByField {
  content = 'content',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
}

export enum ClientRequestSortByField {
  endpoint = 'endpoint',
  ip = 'ip',
  createTimeStamp = 'createTimeStamp',
}

export enum QuizQuestionsSortByField {
  body = 'login',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
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

export enum PublishedStatus {
  ALL = 'all',
  PUBLISHED = 'published',
  NOT_PUBLISHED = 'notPublished',
}

export enum Roles {
  ADMIN = 'admin',
  BLOGGER = 'blogger',
  PUBLIC_USER = 'user',
}
