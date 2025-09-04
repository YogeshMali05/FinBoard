export interface StockData {
  symbol: string;
  name?: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  marketCap?: number;
  lastUpdated: string;
}

export interface HistoricalData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface WatchlistItem {
  symbol: string;
  name: string;
  addedAt: number;
}

export interface MarketGainerData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface AlphaVantageQuote {
  '01. symbol': string;
  '02. open': string;
  '03. high': string;
  '04. low': string;
  '05. price': string;
  '06. volume': string;
  '07. latest trading day': string;
  '08. previous close': string;
  '09. change': string;
  '10. change percent': string;
}

export interface AlphaVantageTimeSeriesResponse {
  'Meta Data': {
    '1. Information': string;
    '2. Symbol': string;
    '3. Last Refreshed': string;
    '4. Interval'?: string;
    '5. Output Size'?: string;
    '6. Time Zone': string;
  };
  [key: string]: AlphaVantageQuote | { [key: string]: AlphaVantageQuote } | { [key: string]: string } | { [key: string]: unknown }; // Time series data
}