export interface PriceData {
  Timestamp: string;
  Price: number;
  ProductID: string;
}

export interface CoinbaseData {
  [key: string]: PriceData[];
}

export interface ChartDataPoint {
  time: string;
  'BTC-USD': number;
  'ETH-USD': number;
  timestamp: number;
}
