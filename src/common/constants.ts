export const DEFAULT_PAGE_NUMBER = 1;
export const DEFAULT_PAGE_SIZE = 10;
export const EMPTY_SEARCH_VALUE = '';
export const MIN_STRINGS_LENGTH = 1;

export const ACCESS_TOKEN_LIFE_TIME = '1d';
export const REFRESH_TOKEN_LIFE_TIME = '10d';

export const QUESTIONS_AMOUNT_IN_ONE_GAME = 5;
export const FINISH_GAME_TIMER = 10000;

export const blogsConstants = {
  MAX_NAME_LENGTH: 15,
  MAX_DESCRIPTION_LENGTH: 500,
  WEBSITE_URL_REG_EXP: new RegExp(
    '^https://([a-zA-Z0-9_-]+\\.)+[a-zA-Z0-9_-]+(\\/[a-zA-Z0-9_-]+)*\\/?$',
  ),
  MAX_WEBSITE_URL_LENGTH: 100,
};

export const postsConstants = {
  MAX_TITLE_LENGTH: 30,
  MAX_SHORT_DESCRIPTION_LENGTH: 100,
  MAX_CONTENT_LENGTH: 1000,
};

export const usersConstants = {
  MIN_LOGIN_LENGTH: 3,
  MAX_LOGIN_LENGTH: 10,
  LOGIN_REG_EXP: new RegExp('^[a-zA-Z0-9_-]*$'),
  MIN_PASSWORD_LENGTH: 6,
  MAX_PASSWORD_LENGTH: 20,
  EMAIL_REG_EXP: new RegExp('^[\\w-.]+@([\\w-]+\\.)+[\\w-]{2,4}$'),
  MIN_BAN_REASON_LENGTH: 20,
};

export const commentsConstants = {
  MIN_CONTENT_LENGTH: 20,
  MAX_CONTENT_LENGTH: 300,
};

export const quizQuestions = {
  MIN_BODY_LENGTH: 10,
  MAX_BODY_LENGTH: 500,
};
