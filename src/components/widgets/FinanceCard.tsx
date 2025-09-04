'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { TrendingUp, TrendingDown, Eye, Star } from 'lucide-react';
import { alphaVantageAPI } from '@/lib/alphaVantageAPI';
import { StockData } from '@/types/financial';
import { FinanceCardVariant } from '@/types/widget';
import { formatCurrency, formatChange } from '@/lib/utils';

interface FinanceCardProps {
  widgetId: string;
  variant: FinanceCardVariant;
  title: string;
  symbols?: string[];
}

interface GainerData {
  ticker: string;
  price: string;
  change_amount: string;
  change_percentage: string;
}

const FinanceCard: React.FC<FinanceCardProps> = ({
  
  variant,
  title,
  symbols = [],
}) => {
  const [data, setData] = useState<StockData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!symbols || symbols.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      let results: StockData[] = [];

      if (variant === 'gainers') {
        const gainers = await alphaVantageAPI.getMarketGainers();
        results = gainers.slice(0, 5).map((gainer: GainerData) => ({
          symbol: gainer.ticker,
          name: gainer.ticker,
          price: parseFloat(gainer.price),
          change: parseFloat(gainer.change_amount),
          changePercent: parseFloat(gainer.change_percentage.replace('%', '')),
          high: 0,
          low: 0,
          open: 0,
          previousClose: 0,
          lastUpdated: new Date().toISOString(),
        }));
      } else {
        const promises = symbols.slice(0, 5).map(symbol =>
          alphaVantageAPI.getQuote(symbol.trim())
        );
        const settled = await Promise.allSettled(promises);
        results = settled
          .filter((result): result is PromiseFulfilledResult<StockData> =>
            result.status === 'fulfilled'
          )
          .map(result => result.value);
      }

      setData(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  }, [symbols, variant]);

  useEffect(() => {
    fetchData();

    const interval = setInterval(fetchData, 120000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const getVariantIcon = () => {
    switch (variant) {
      case 'watchlist':
        return <Eye className="w-5 h-5" />;
      case 'gainers':
        return <TrendingUp className="w-5 h-5" />;
      case 'performance':
        return <Star className="w-5 h-5" />;
      default:
        return <TrendingUp className="w-5 h-5" />;
    }
  };

  const getVariantColor = () => {
    switch (variant) {
      case 'watchlist':
        return 'text-blue-600 dark:text-blue-400';
      case 'gainers':
        return 'text-green-600 dark:text-green-400';
      case 'performance':
        return 'text-purple-600 dark:text-purple-400';
      default:
        return 'text-blue-600 dark:text-blue-400';
    }
  };

  if (isLoading && data.length === 0) {
    return (
      <div className="widget-container">
        <div className="animate-pulse">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="widget-container">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className={getVariantColor()}>
            {getVariantIcon()}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>
        {isLoading && data.length > 0 && (
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
        )}
      </div>

      {error && (
        <div className="text-center text-red-500 py-8">
          <p className="text-sm">{error}</p>
          <button
            onClick={fetchData}
            className="mt-2 text-xs btn-primary"
          >
            Retry
          </button>
        </div>
      )}

      {!error && (
        <div className="space-y-3">
          {data.length === 0 && !isLoading ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
              {variant === 'watchlist' ? 'No stocks in watchlist' : 'No data available'}
            </div>
          ) : (
            data.map((stock) => {
              const changeData = formatChange(stock.change, stock.changePercent);
              return (
                <div
                  key={stock.symbol}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className={changeData.colorClass}>
                      {changeData.isPositive ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white text-sm">
                        {stock.symbol}
                      </div>
                      {stock.name && stock.name !== stock.symbol && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-20">
                          {stock.name}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                      {formatCurrency(stock.price)}
                    </div>
                    <div className={`text-xs ${changeData.colorClass}`}>
                      {changeData.changePercent}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {variant === 'performance' && data.length > 0 && !error && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Total Gainers
              </div>
              <div className="text-sm font-medium text-green-600 dark:text-green-400">
                {data.filter(stock => stock.change >= 0).length}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Total Losers
              </div>
              <div className="text-sm font-medium text-red-600 dark:text-red-400">
                {data.filter(stock => stock.change < 0).length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceCard;