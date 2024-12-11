type Currency = {
  date: number;
  rateCross?: number;
  rateSell?: number;
  rateBuy?: number;
}

export interface NumericCurrency extends Currency {
  currencyCodeA: number;
  currencyCodeB: number;
}

export interface LiteralCurrency extends Currency {
  currencyCodeA: string;
  currencyCodeB: string;
}
