import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsStringOrNumber(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isStringOrNumber',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return (
            (typeof value === 'string' || typeof value === 'number') &&
            value !== null
          );
        },
        defaultMessage(args: ValidationArguments) {
          return `${
            args.property
          } must be a string or a number, but received ${typeof args.value}`;
        },
      },
    });
  };
}
