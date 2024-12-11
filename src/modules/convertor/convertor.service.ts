import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';

import { MonobankApiService } from '../../third-party/monobank/monobank-api.service';
import { LiteralCurrency, NumericCurrency } from '../shared/types';
import { iso4217Mapping } from '../shared/helpers';
import { CurrencyConversionException } from '../shared/exceptions';

@Injectable()
export class ConvertorService {
  @Inject(MonobankApiService)
  private readonly monobankApiService: MonobankApiService;

  @Inject(CACHE_MANAGER) private readonly cacheManager: Cache;

  private readonly mainCurrencyCode = 980;
  private readonly cacheTtl = 300000; // 5 min

  async convertCurrency(
    amount: number,
    sourceCurrency: string | number,
    targetCurrency: string | number,
  ): Promise<number> {
    const getRate = (rate: NumericCurrency | LiteralCurrency) => {
      const conversionRate = rate.rateSell || rate.rateBuy || rate.rateCross;
      if (!conversionRate) {
        throw new CurrencyConversionException(
          'No valid conversion rate found for the specified currencies',
          HttpStatus.NOT_FOUND,
        );
      }
      return conversionRate;
    };

    try {
      const useLiteralCodes = typeof sourceCurrency === 'string';
      const ratesData = await this.getExchangeRates(useLiteralCodes);

      if (sourceCurrency === targetCurrency) {
        return amount;
      }

      const directRate = (ratesData as NumericCurrency[]).find(
        (rate) =>
          rate.currencyCodeA === sourceCurrency &&
          rate.currencyCodeB === targetCurrency,
      );

      if (directRate) {
        return amount * getRate(directRate);
      }

      const reverseRate = (ratesData as NumericCurrency[]).find(
        (rate) =>
          rate.currencyCodeA === targetCurrency &&
          rate.currencyCodeB === sourceCurrency,
      );

      if (reverseRate) {
        return amount / getRate(reverseRate);
      }

      // Cross conversion through main currency
      const mainCurrencyCode = useLiteralCodes
        ? this.mainCurrencyCode
        : iso4217Mapping[this.mainCurrencyCode];

      const sourceToUah = (ratesData as NumericCurrency[]).find(
        (rate) =>
          (rate.currencyCodeA === sourceCurrency &&
            rate.currencyCodeB === mainCurrencyCode) ||
          (rate.currencyCodeA === mainCurrencyCode &&
            rate.currencyCodeB === sourceCurrency),
      );

      const mainCurrencyToTarget = (ratesData as NumericCurrency[]).find(
        (rate) =>
          (rate.currencyCodeA === targetCurrency &&
            rate.currencyCodeB === mainCurrencyCode) ||
          (rate.currencyCodeA === mainCurrencyCode &&
            rate.currencyCodeB === targetCurrency),
      );

      if (!sourceToUah || !mainCurrencyToTarget) {
        throw new CurrencyConversionException(
          'No conversion path found between the specified currencies',
          HttpStatus.NOT_FOUND,
        );
      }

      // Calculate cross-conversion
      let amountInMainCurrency: number;
      if (sourceToUah.currencyCodeA === sourceCurrency) {
        amountInMainCurrency = amount * getRate(sourceToUah);
      } else {
        amountInMainCurrency = amount / getRate(sourceToUah);
      }

      if (mainCurrencyToTarget.currencyCodeA === targetCurrency) {
        return amountInMainCurrency / getRate(mainCurrencyToTarget);
      } else {
        return amountInMainCurrency * getRate(mainCurrencyToTarget);
      }
    } catch (error) {
      if (error instanceof CurrencyConversionException) {
        throw error;
      }

      throw new CurrencyConversionException(
        'An unexpected error occurred during currency conversion',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async getExchangeRates<T extends boolean | undefined>(
    useLiteralCodes?: T,
  ): Promise<T extends true ? LiteralCurrency[] : NumericCurrency[]> {
    const rates = await this.fetchExchangeRates();

    if (useLiteralCodes !== true) {
      return rates as T extends true ? LiteralCurrency[] : NumericCurrency[];
    }

    return rates.map((el) => {
      return {
        ...el,
        currencyCodeA: iso4217Mapping[el.currencyCodeA],
        currencyCodeB: iso4217Mapping[el.currencyCodeB],
      };
    });
  }

  private async fetchExchangeRates(): Promise<NumericCurrency[]> {
    try {
      const cacheKey = 'exchangeRates';
      const cachedRates = await this.cacheManager.get<any[]>(cacheKey);

      if (cachedRates) {
        return cachedRates;
      }

      const rates = await this.monobankApiService.getExchangeRates();

      await this.cacheManager.set(cacheKey, rates, this.cacheTtl);
      return rates;
    } catch (error) {
      throw new HttpException(
        'Failed to fetch exchange rates',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
