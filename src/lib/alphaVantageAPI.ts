import axios from 'axios';
import { StockData, HistoricalData, AlphaVantageQuote } from '@/types/financial';

const BASE_URL = 'https://www.alphavantage.co/query';
const API_KEY = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY || 'demo';

interface TimeSeriesData {
  '1. open': string;
  '2. high': string;
  '3. low': string;
  '4. close': string;
  '5. volume': string;
}

interface MarketGainer {
  ticker: string;
  price: string;
  change_amount: string;
  change_percentage: string;
}

interface SearchMatch {
  '1. symbol': string;
  '2. name': string;
  '3. type': string;
  '4. region': string;
  '5. marketOpen': string;
  '6. marketClose': string;
  '7. timezone': string;
  '8. currency': string;
  '9. matchScore': string;
}

// Rate limiting
const requestQueue: Array<() => void> = [];
let isProcessing = false;
let lastRequestTime = 0;
const MIN_INTERVAL = 12000; // 12 seconds between requests (5 requests per minute)

const processQueue = () => {
  if (isProcessing || requestQueue.length === 0) return;
  
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest >= MIN_INTERVAL) {
    isProcessing = true;
    const nextRequest = requestQueue.shift();
    lastRequestTime = Date.now();
    
    if (nextRequest) {
      nextRequest();
    }
    
    isProcessing = false;
    
    // Process next request after interval
    if (requestQueue.length > 0) {
      setTimeout(processQueue, MIN_INTERVAL);
    }
  } else {
    // Wait for remaining time
    setTimeout(processQueue, MIN_INTERVAL - timeSinceLastRequest);
  }
};

const queueRequest = <T>(requestFn: () => Promise<T>): Promise<T> => {
  return new Promise((resolve, reject) => {
    requestQueue.push(async () => {
      try {
        const result = await requestFn();
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
    processQueue();
  });
};

export const alphaVantageAPI = {
  // Get real-time quote
  async getQuote(symbol: string): Promise<StockData> {
    return queueRequest(async () => {
      try {
        const response = await axios.get(BASE_URL, {
          params: {
            function: 'GLOBAL_QUOTE',
            symbol,
            apikey: API_KEY,
          },
        });

        // Debug logging
        console.log('API Response:', response.data);

        if (response.data['Error Message']) {
          throw new Error(response.data['Error Message']);
        }

        if (response.data['Note']) {
          throw new Error('API call frequency exceeded. Please try again later.');
        }

        // Check if using demo key
        if (API_KEY === 'demo') {
          throw new Error('Demo API key has limited functionality. Please get a free API key from Alpha Vantage.');
        }

        const quote: AlphaVantageQuote = response.data['Global Quote'];
        
        if (!quote || Object.keys(quote).length === 0) {
          console.error('Full response:', JSON.stringify(response.data, null, 2));
          throw new Error(`No quote data found for symbol: ${symbol}. Please check if the symbol is valid.`);
        }

        return {
          symbol: quote['01. symbol'],
          price: parseFloat(quote['05. price']),
          change: parseFloat(quote['09. change']),
          changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
          high: parseFloat(quote['03. high']),
          low: parseFloat(quote['04. low']),
          open: parseFloat(quote['02. open']),
          previousClose: parseFloat(quote['08. previous close']),
          volume: parseInt(quote['06. volume']),
          lastUpdated: quote['07. latest trading day'],
        };
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        }
        throw new Error('Failed to fetch quote data');
      }
    });
  },

  // Mock data fallback for demo purposes
  async getMockQuote(symbol: string): Promise<StockData> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockPrice = 150 + Math.random() * 50;
    const mockChange = (Math.random() - 0.5) * 10;
    
    return {
      symbol: symbol.toUpperCase(),
      price: mockPrice,
      change: mockChange,
      changePercent: (mockChange / mockPrice) * 100,
      high: mockPrice + Math.random() * 5,
      low: mockPrice - Math.random() * 5,
      open: mockPrice + (Math.random() - 0.5) * 3,
      previousClose: mockPrice - mockChange,
      volume: Math.floor(Math.random() * 1000000) + 100000,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
  },

  // Get intraday data for charts
  async getIntradayData(symbol: string, interval: '1min' | '5min' | '15min' | '30min' | '60min' = '5min'): Promise<HistoricalData[]> {
    return queueRequest(async () => {
      try {
        const response = await axios.get(BASE_URL, {
          params: {
            function: 'TIME_SERIES_INTRADAY',
            symbol,
            interval,
            apikey: API_KEY,
            outputsize: 'compact',
          },
        });

        if (response.data['Error Message']) {
          throw new Error(response.data['Error Message']);
        }

        if (response.data['Note']) {
          throw new Error('API call frequency exceeded. Please try again later.');
        }

        if (API_KEY === 'demo') {
          return this.getMockHistoricalData();
        }

        const timeSeriesKey = `Time Series (${interval})`;
        const timeSeries = response.data[timeSeriesKey];
        
        if (!timeSeries) {
          throw new Error('No intraday data available for this symbol');
        }

        return Object.entries(timeSeries)
          .slice(0, 100) // Limit to last 100 data points
          .map(([date, data]) => {
            const tsData = data as TimeSeriesData;
            return {
              date,
              open: parseFloat(tsData['1. open']),
              high: parseFloat(tsData['2. high']),
              low: parseFloat(tsData['3. low']),
              close: parseFloat(tsData['4. close']),
              volume: parseInt(tsData['5. volume']),
            };
          })
          .reverse(); // Oldest to newest
      } catch (error) {
        console.error('Intraday data error:', error);
        return this.getMockHistoricalData();
      }
    });
  },

  // Mock historical data
  async getMockHistoricalData(): Promise<HistoricalData[]> {
    const data: HistoricalData[] = [];
    const basePrice = 150;
    let currentPrice = basePrice;
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const change = (Math.random() - 0.5) * 10;
      currentPrice = Math.max(currentPrice + change, 50);
      
      const high = currentPrice + Math.random() * 5;
      const low = currentPrice - Math.random() * 5;
      const open = currentPrice + (Math.random() - 0.5) * 3;
      
      data.push({
        date: date.toISOString().split('T')[0],
        open,
        high,
        low,
        close: currentPrice,
        volume: Math.floor(Math.random() * 1000000) + 100000,
      });
    }
    
    return data;
  },

  // Get daily data
  async getDailyData(symbol: string): Promise<HistoricalData[]> {
    return queueRequest(async () => {
      try {
        if (API_KEY === 'demo') {
          return this.getMockHistoricalData();
        }

        const response = await axios.get(BASE_URL, {
          params: {
            function: 'TIME_SERIES_DAILY',
            symbol,
            apikey: API_KEY,
            outputsize: 'compact',
          },
        });

        if (response.data['Error Message']) {
          throw new Error(response.data['Error Message']);
        }

        if (response.data['Note']) {
          throw new Error('API call frequency exceeded. Please try again later.');
        }

        const timeSeries = response.data['Time Series (Daily)'];
        
        if (!timeSeries) {
          throw new Error('No daily data available for this symbol');
        }

        return Object.entries(timeSeries)
          .slice(0, 100) // Last 100 days
          .map(([date, data]) => {
            const tsData = data as TimeSeriesData;
            return {
              date,
              open: parseFloat(tsData['1. open']),
              high: parseFloat(tsData['2. high']),
              low: parseFloat(tsData['3. low']),
              close: parseFloat(tsData['4. close']),
              volume: parseInt(tsData['5. volume']),
            };
          })
          .reverse();
      } catch (error) {
        console.error('Daily data error:', error);
        return this.getMockHistoricalData();
      }
    });
  },

  // Get market gainers (using top gainers endpoint)
  async getMarketGainers(): Promise<MarketGainer[]> {
    return queueRequest(async () => {
      try {
        if (API_KEY === 'demo') {
          return this.getMockMarketGainers();
        }

        const response = await axios.get(BASE_URL, {
          params: {
            function: 'TOP_GAINERS_LOSERS',
            apikey: API_KEY,
          },
        });

        if (response.data['Error Message']) {
          throw new Error(response.data['Error Message']);
        }

        if (response.data['Note']) {
          throw new Error('API call frequency exceeded. Please try again later.');
        }

        return response.data['top_gainers']?.slice(0, 10) || [];
      } catch (error) {
        console.error('Market gainers error:', error);
        return this.getMockMarketGainers();
      }
    });
  },

  // Mock market gainers
  async getMockMarketGainers(): Promise<MarketGainer[]> {
    const symbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'NVDA', 'META', 'NFLX', 'AMD', 'CRM'];
    
    return symbols.map(ticker => ({
      ticker,
      price: (100 + Math.random() * 200).toFixed(2),
      change_amount: (Math.random() * 10 + 1).toFixed(2),
      change_percentage: (Math.random() * 8 + 2).toFixed(2) + '%',
    }));
  },

  // Search stocks
  async searchSymbols(keywords: string): Promise<SearchMatch[]> {
    return queueRequest(async () => {
      try {
        if (API_KEY === 'demo') {
          return this.getMockSearchResults(keywords);
        }

        const response = await axios.get(BASE_URL, {
          params: {
            function: 'SYMBOL_SEARCH',
            keywords,
            apikey: API_KEY,
          },
        });

        if (response.data['Error Message']) {
          throw new Error(response.data['Error Message']);
        }

        return response.data['bestMatches']?.slice(0, 10) || [];
      } catch (error) {
        console.error('Search error:', error);
        return this.getMockSearchResults(keywords);
      }
    });
  },

  // Mock search results
  async getMockSearchResults(keywords: string): Promise<SearchMatch[]> {
    const mockResults = [
      { symbol: 'AAPL', name: 'Apple Inc.' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.' },
      { symbol: 'MSFT', name: 'Microsoft Corporation' },
      { symbol: 'AMZN', name: 'Amazon.com Inc.' },
      { symbol: 'TSLA', name: 'Tesla Inc.' },
    ];

    const filtered = mockResults.filter(stock => 
      stock.symbol.toLowerCase().includes(keywords.toLowerCase()) ||
      stock.name.toLowerCase().includes(keywords.toLowerCase())
    );

    return filtered.map(stock => ({
      '1. symbol': stock.symbol,
      '2. name': stock.name,
      '3. type': 'Equity',
      '4. region': 'United States',
      '5. marketOpen': '09:30',
      '6. marketClose': '16:00',
      '7. timezone': 'UTC-04',
      '8. currency': 'USD',
      '9. matchScore': '1.0000',
    }));
  },
};