import {
  BadRequestException,
  Body,
  Controller,
  Inject,
  Post,
} from '@nestjs/common';
import { ApiTags, ApiResponse } from '@nestjs/swagger';

import {
  CurrencyConversionDto,
} from './dtos/convert-currency.dto';
import { ConvertorService } from '../convertor.service';

@ApiTags('currency')
@Controller('currency')
export class ConvertorController {
  @Inject(ConvertorService)
  private readonly convertorService: ConvertorService;

  @Post('convert')
  @ApiResponse({
    status: 200,
    description: 'Currency conversion successful',
    schema: {
      example: {
        convertedAmount: 85,
        sourceCurrency: 'USD',
        targetCurrency: 'EUR',
      },
    },
  })
  async convertCurrency(
    @Body()
    convertCurrencyDto:
      CurrencyConversionDto,
  ) {
    const { amount, sourceCurrency, targetCurrency } = convertCurrencyDto;

    if (typeof sourceCurrency !== typeof targetCurrency) {
      throw new BadRequestException(
        'Source and Target currencies must be the same type',
      );
    }

    const convertedAmount = await this.convertorService.convertCurrency(
      amount,
      sourceCurrency,
      targetCurrency,
    );

    return {
      convertedAmount,
      sourceCurrency,
      targetCurrency,
    };
  }
}
