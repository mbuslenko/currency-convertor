import { HttpException, HttpStatus } from '@nestjs/common';

export class CurrencyConversionException extends HttpException {
  constructor(message: string, status: HttpStatus = HttpStatus.BAD_REQUEST) {
    super(message, status);
  }
}
