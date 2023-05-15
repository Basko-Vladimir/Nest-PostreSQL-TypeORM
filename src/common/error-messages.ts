import {
  generateCustomBadRequestException,
  makeCapitalizeString,
} from './utils';

export const DATE_ERROR_MESSAGE = 'Can not create an entity with a past Date';

export const emailErrorMessages = {
  MISSING_USER_WITH_EMAIL_ERROR: `User with such email hasn't been found!`,
  EMAIL_SERVICE_ERROR_MESSAGE: 'Some error with email service, try later!',
  CONFIRMED_EMAIL_ERROR: 'Provided email was confirmed already!`',
};

export const confirmationCodeErrorMessages = {
  INVALID_CONFIRMATION_CODE: 'Confirmation code is not valid!',
  EXISTED_CONFIRMATION_CODE: 'Confirmation code is confirmed already!',
};

export const authErrorsMessages = {
  INCORRECT_LOGIN_OR_PASSWORD: 'Incorrect Login or Password!',
  INVALID_TOKEN: 'Invalid token!',
};

export const INTERNAL_SERVER_ERROR = 'Something went wrong...';

export const generateLengthErrorMessage = (
  fieldName: string,
  value: number,
  type: 'min' | 'max',
): string => {
  fieldName = makeCapitalizeString(fieldName);

  switch (type) {
    case 'min': {
      return `${fieldName} length can't be less than ${value} symbol!`;
    }
    case 'max': {
      return `${fieldName} length can't be more than ${value} symbol!`;
    }
    default:
      throw new Error(
        'Incorrect input parameters for generateLengthErrorMessage function',
      );
  }
};

export const generateLengthRangeErrorMessage = (
  fieldName: string,
  minValue: number,
  maxValue: number,
): string => {
  return `${makeCapitalizeString(
    fieldName,
  )} should be from ${minValue} to ${maxValue} chars`;
};

export const generateRegExpError = (
  fieldName: string,
  regExp: RegExp,
): string => {
  return `${makeCapitalizeString(
    fieldName,
  )} doesn't match to pattern ${regExp}`;
};

export const generateExistingFieldError = (
  entity: string,
  field: string,
): void => {
  const message = `${makeCapitalizeString(entity)}
   with such ${field} already exists.`;

  generateCustomBadRequestException(message, field);
};

export const generateMissedPropError = (fieldName: string): string => {
  return `You didn't provide '${fieldName.toLowerCase()}' field`;
};
