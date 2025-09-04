export type WidgetType = 
  | 'stock-table' 
  | 'finance-card' 
  | 'line-chart' 
  | 'candlestick-chart';

export type FinanceCardVariant = 
  | 'watchlist' 
  | 'gainers' 
  | 'performance' 
  | 'market-overview';

export interface Widget {
  id: string;
  type: WidgetType;
  title: string;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  config: WidgetConfig;
  createdAt: number;
  updatedAt: number;
}

export interface WidgetConfig {
  symbols?: string[];
  symbol?: string; // For single symbol widgets like charts
  variant?: FinanceCardVariant;
  period?: string; // '1D', '1W', '1M', '3M', '1Y'
  pageSize?: number; // For tables
  refreshInterval?: number;
  title?: string;
  [key: string]: unknown;
}

export interface DashboardState {
  widgets: Widget[];
  isEditMode: boolean;
  selectedWidget: string | null;
  isDragging: boolean;
  theme: 'light' | 'dark';
}