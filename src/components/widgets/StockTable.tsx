'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, TrendingUp, TrendingDown, MoreVertical } from 'lucide-react';
import { alphaVantageAPI } from '@/lib/alphaVantageAPI';
import { StockData } from '@/types/financial';
import { formatCurrency, formatNumber, formatChange } from '@/lib/utils';

interface StockTableProps {
  symbols: string[];
  title: string;
  pageSize?: number;
}

const StockTable: React.FC<StockTableProps> = ({
  symbols,
  title,
  pageSize = 10,
}) => {
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof StockData | null;
    direction: 'asc' | 'desc';
  }>({ key: null, direction: 'asc' });

  const fetchStockData = React.useCallback(async () => {
    if (!symbols || symbols.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const promises = symbols.map(symbol => alphaVantageAPI.getQuote(symbol.trim()));
      const results = await Promise.allSettled(promises);
      
      const successfulResults: StockData[] = [];
      
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          successfulResults.push(result.value);
        } else {
          console.error(`Failed to fetch ${symbols[index]}:`, result.reason);
        }
      });

      setStockData(successfulResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stock data');
    } finally {
      setIsLoading(false);
    }
  }, [symbols]);

  useEffect(() => {
    fetchStockData();

    const interval = setInterval(fetchStockData, 30000);
    return () => clearInterval(interval);
  }, [fetchStockData]);

  const filteredAndSortedData = useMemo(() => {
    const filtered = stockData.filter(stock =>
      stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (stock.name && stock.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];
        
        if (aValue == null) return 1;
        if (bValue == null) return -1;
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [stockData, searchTerm, sortConfig]);

  const totalPages = Math.ceil(filteredAndSortedData.length / pageSize);
  const paginatedData = filteredAndSortedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSort = (key: keyof StockData) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  if (isLoading && stockData.length === 0) {
    return (
      <div className="widget-container">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-1/3"></div>
          <div className="space-y-3">
            {[...Array(pageSize)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="widget-container">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {title}
        </h3>
        <button
          onClick={fetchStockData}
          disabled={isLoading}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search stocks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {error && (
        <div className="text-center text-red-500 py-8">
          <p>{error}</p>
          <button
            onClick={fetchStockData}
            className="mt-2 btn-primary text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {!error && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th
                  className="text-left py-3 px-2 text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                  onClick={() => handleSort('symbol')}
                >
                  Symbol
                </th>
                <th
                  className="text-right py-3 px-2 text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                  onClick={() => handleSort('price')}
                >
                  Price
                </th>
                <th
                  className="text-right py-3 px-2 text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                  onClick={() => handleSort('change')}
                >
                  Change
                </th>
                <th
                  className="text-right py-3 px-2 text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                  onClick={() => handleSort('changePercent')}
                >
                  Change %
                </th>
                <th
                  className="text-right py-3 px-2 text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
                  onClick={() => handleSort('volume')}
                >
                  Volume
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((stock) => {
                const changeData = formatChange(stock.change, stock.changePercent);
                return (
                  <tr
                    key={stock.symbol}
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="py-3 px-2">
                      <div className="flex items-center space-x-2">
                        {changeData.isPositive ? (
                          <TrendingUp className="w-4 h-4 text-green-500" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-500" />
                        )}
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {stock.symbol}
                          </div>
                          {stock.name && (
                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-32">
                              {stock.name}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-right font-medium text-gray-900 dark:text-white">
                      {formatCurrency(stock.price)}
                    </td>
                    <td className={`py-3 px-2 text-right font-medium ${changeData.colorClass}`}>
                      {changeData.change}
                    </td>
                    <td className={`py-3 px-2 text-right font-medium ${changeData.colorClass}`}>
                      {changeData.changePercent}
                    </td>
                    <td className="py-3 px-2 text-right text-gray-600 dark:text-gray-400 text-sm">
                      {stock.volume ? formatNumber(stock.volume) : 'N/A'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {paginatedData.length === 0 && !isLoading && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No stocks found
            </div>
          )}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Showing {((currentPage - 1) * pageSize) + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredAndSortedData.length)} of{' '}
            {filteredAndSortedData.length} stocks
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Previous
            </button>
            <span className="px-3 py-1 text-sm">
              {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {isLoading && stockData.length > 0 && (
        <div className="absolute top-2 right-2 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
      )}
    </div>
  );
};

export default StockTable;