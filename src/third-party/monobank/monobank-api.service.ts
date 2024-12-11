import { Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

import { NumericCurrency } from '../../modules/shared/types';

@Injectable()
export class MonobankApiService {
  private readonly axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: 'https://api.monobank.ua/',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        return Promise.reject(error);
      },
    );
  }

  async getExchangeRates(): Promise<NumericCurrency[]> {
    const response = await this.axiosInstance.get('/bank/currency');

    return response.data;
  }
}
