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
  body = 'body',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
}

export enum QuizGameSortByField {
  pairCreatedDate = 'createdAt',
  startGameDate = 'startGameDate',
  finishGameDate = 'finishGameDate',
  status = 'status',
}

export enum StatisticSortByField {
  SUM_SCORE = 'sumScore',
  AVG_SCORES = 'avgScores',
  GAMES_COUNT = 'gamesCount',
  WINS_COUNT = 'winsCount',
  LOSSES_COUNT = 'lossesCount',
  DRAWS_COUNT = 'drawsCount',
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
  QUIZ_GAME_ID = 'quizGameId',
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

export enum QuizGameStatus {
  PENDING_SECOND_PLAYER = 'PendingSecondPlayer',
  ACTIVE = 'Active',
  FINISHED = 'Finished',
}

export enum AnswerStatus {
  CORRECT = 'Correct',
  INCORRECT = 'Incorrect',
}

export enum PlayerNumber {
  ONE = 1,
  TWO = 2,
}

export enum PlayerResult {
  WINNER = 'winner',
  LOSER = 'loser',
  DRAW = 'draw',
}

export enum ImageType {
  WALLPAPER = 'wallpaper',
  MAIN = 'main',
}

export enum EntityDirectory {
  BLOGS = 'blogs',
  POSTS = 'posts',
}
