'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Calendar } from 'lucide-react';
import { alphaVantageAPI } from '@/lib/alphaVantageAPI';
import { HistoricalData } from '@/types/financial';
import { formatCurrency, formatDate } from '@/lib/utils';

interface LineChartProps {
  widgetId: string;
  symbol: string;
  title: string;
  period?: string;
  height?: number;
}

interface TooltipPayload {
  value: number;
  payload: HistoricalData;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

const LineChart: React.FC<LineChartProps> = ({
  
  symbol,
  title,
  period = '1D',
  height = 300,
}) => {
  const [data, setData] = useState<HistoricalData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(period);

  const fetchChartData = useCallback(async (fetchPeriod: string = selectedPeriod) => {
    if (!symbol) return;

    setIsLoading(true);
    setError(null);

    try {
      let chartData: HistoricalData[] = [];

      if (fetchPeriod === '1D') {
        // Fetch intraday data
        chartData = await alphaVantageAPI.getIntradayData(symbol, '5min');
      } else {
        // Fetch daily data for other periods
        const dailyData = await alphaVantageAPI.getDailyData(symbol);
        
        // Filter data based on period
        const now = new Date();
        const startDate = new Date();
        
        switch (fetchPeriod) {
          case '1W':
            startDate.setDate(now.getDate() - 7);
            break;
          case '1M':
            startDate.setMonth(now.getMonth() - 1);
            break;
          case '3M':
            startDate.setMonth(now.getMonth() - 3);
            break;
          case '1Y':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        }
        
        chartData = dailyData.filter(item => 
          new Date(item.date) >= startDate
        );
      }

      setData(chartData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch chart data');
    } finally {
      setIsLoading(false);
    }
  }, [symbol, selectedPeriod]);

  useEffect(() => {
    fetchChartData();

    // Refresh every 5 minutes for intraday, 30 minutes for daily
    const refreshInterval = selectedPeriod === '1D' ? 300000 : 1800000;
    const interval = setInterval(() => fetchChartData(), refreshInterval);
    
    return () => clearInterval(interval);
  }, [fetchChartData, selectedPeriod]);

  const handlePeriodChange = (newPeriod: string) => {
    setSelectedPeriod(newPeriod);
    fetchChartData(newPeriod);
  };

  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900 dark:text-white text-sm">
            {formatDate(label || '', selectedPeriod === '1D' ? 'time' : 'short')}
          </p>
          <p className="text-blue-600 dark:text-blue-400 text-sm">
            Close: {formatCurrency(data.close)}
          </p>
          {data.volume && (
            <p className="text-gray-500 dark:text-gray-400 text-xs">
              Vol: {data.volume.toLocaleString()}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  const periods = ['1D', '1W', '1M', '3M', '1Y'];

  if (isLoading && data.length === 0) {
    return (
      <div className="widget-container">
        <div className="animate-pulse">
          <div className="flex justify-between items-center mb-4">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="flex space-x-1">
              {periods.map((p, i) => (
                <div key={i} className="h-6 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="widget-container">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
        </div>
        <div className="flex space-x-1">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => handlePeriodChange(p)}
              className={`px-2 py-1 text-xs rounded ${
                selectedPeriod === p
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="text-center text-red-500 py-8">
          <p className="text-sm">{error}</p>
          <button
            onClick={() => fetchChartData()}
            className="mt-2 btn-primary text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {/* Chart */}
      {!error && (
        <div style={{ height }}>
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <RechartsLineChart
                data={data}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => 
                    formatDate(value, selectedPeriod === '1D' ? 'time' : 'short')
                  }
                  className="text-gray-600 dark:text-gray-400"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => formatCurrency(value, 0)}
                  className="text-gray-600 dark:text-gray-400"
                  domain={['dataMin * 0.995', 'dataMax * 1.005']}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="close"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, stroke: '#3b82f6', strokeWidth: 2 }}
                />
              </RechartsLineChart>
            </ResponsiveContainer>
          ) : !isLoading && (
            <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <div className="text-center">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No chart data available</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading indicator */}
      {isLoading && data.length > 0 && (
        <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
      )}

      {/* Data info */}
      {data.length > 0 && !error && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
          {symbol.toUpperCase()} • {data.length} data points • Last updated: {formatDate(new Date(), 'time')}
        </div>
      )}
    </div>
  );
};

export default LineChart;