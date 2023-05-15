import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  ValidationOptions,
  registerDecorator,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsNotEmptyString', async: false })
class IsNotEmptyContentValidator implements ValidatorConstraintInterface {
  validate(text: string) {
    return typeof text === 'string' && text.trim() !== '';
  }

  defaultMessage(args: ValidationArguments) {
    return `Field "${args.property}" can not be empty string!`;
  }
}

export function IsNotEmptyContent(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsNotEmptyContentValidator,
    });
  };
}
