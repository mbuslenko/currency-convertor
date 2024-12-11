
import {
  ApiProperty,
} from '@nestjs/swagger';
import { IsNumber, IsNotEmpty } from 'class-validator';
import { IsStringOrNumber } from '../../../shared/decorators/is-string-or-number.decorator';

export class CurrencyConversionDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: 100,
  })
  amount: number;

  @IsStringOrNumber()
  @IsNotEmpty()
  @ApiProperty({ example: 'UAH' })
  sourceCurrency: string | number;

  @IsStringOrNumber()
  @IsNotEmpty()
  @ApiProperty({ example: 'USD' })
  targetCurrency: string | number;
}
