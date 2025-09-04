'use client';

import React, { useState } from 'react';
import { X, Plus, Table, BarChart3, LineChart as LineChartIcon } from 'lucide-react';
import { Widget, WidgetType, FinanceCardVariant } from '@/types/widget';
import { generateId, isValidSymbol } from '@/lib/utils';

interface WidgetLibraryProps {
  onAddWidget: (widget: Widget) => void;
  onClose: () => void;
}

interface WidgetTemplate {
  type: WidgetType;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const WIDGET_TEMPLATES: WidgetTemplate[] = [
  {
    type: 'stock-table',
    name: 'Stock Table',
    description: 'Paginated table with stock data, filters, and search',
    icon: <Table className="w-6 h-6" />,
    color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
  },
  {
    type: 'finance-card',
    name: 'Finance Card',
    description: 'Compact card view for watchlists, gainers, or performance',
    icon: <BarChart3 className="w-6 h-6" />,
    color: 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400',
  },
  {
    type: 'line-chart',
    name: 'Line Chart',
    description: 'Interactive line chart showing stock price over time',
    icon: <LineChartIcon className="w-6 h-6" />,
    color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
  },
];

const FINANCE_CARD_VARIANTS: { value: FinanceCardVariant; label: string }[] = [
  { value: 'watchlist', label: 'Watchlist' },
  { value: 'gainers', label: 'Market Gainers' },
  { value: 'performance', label: 'Performance' },
  { value: 'market-overview', label: 'Market Overview' },
];

const WidgetLibrary: React.FC<WidgetLibraryProps> = ({ onAddWidget, onClose }) => {
  const [selectedType, setSelectedType] = useState<WidgetType | null>(null);
  const [config, setConfig] = useState({
    title: '',
    symbols: '',
    symbol: '', // For single symbol widgets
    variant: 'watchlist' as FinanceCardVariant,
    period: '1D',
    pageSize: 10,
  });

  const handleAddWidget = () => {
    if (!selectedType || !config.title.trim()) return;

    // Validate symbols
    const symbolList = config.symbols
      .split(',')
      .map(s => s.trim().toUpperCase())
      .filter(s => s && isValidSymbol(s));

    if ((selectedType === 'stock-table' || selectedType === 'finance-card') && symbolList.length === 0) {
      alert('Please enter at least one valid stock symbol');
      return;
    }

    if (selectedType === 'line-chart' && !config.symbol.trim()) {
      alert('Please enter a stock symbol for the chart');
      return;
    }

    const widget: Widget = {
      id: generateId(),
      type: selectedType,
      title: config.title.trim(),
      position: { x: 0, y: 0 },
      size: { 
        width: selectedType === 'finance-card' ? 1 : 2, 
        height: selectedType === 'line-chart' ? 2 : 1 
      },
      config: {
        ...(selectedType === 'line-chart' 
          ? { symbol: config.symbol.trim().toUpperCase(), period: config.period }
          : { symbols: symbolList }
        ),
        ...(selectedType === 'finance-card' && { variant: config.variant }),
        ...(selectedType === 'stock-table' && { pageSize: config.pageSize }),
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    onAddWidget(widget);
    onClose();
  };

  const resetForm = () => {
    setSelectedType(null);
    setConfig({
      title: '',
      symbols: '',
      symbol: '',
      variant: 'watchlist',
      period: '1D',
      pageSize: 10,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Add New Widget
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {!selectedType ? (
            // Widget type selection
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Choose Widget Type
              </h3>
              <div className="grid gap-4">
                {WIDGET_TEMPLATES.map((template) => (
                  <button
                    key={template.type}
                    onClick={() => {
                      setSelectedType(template.type);
                      setConfig(prev => ({
                        ...prev,
                        title: template.name,
                      }));
                    }}
                    className="flex items-start space-x-4 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-left"
                  >
                    <div className={`p-3 rounded-lg ${template.color}`}>
                      {template.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {template.name}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {template.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Widget configuration
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Configure {WIDGET_TEMPLATES.find(t => t.type === selectedType)?.name}
                </h3>
                <button
                  onClick={resetForm}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  ← Back to selection
                </button>
              </div>

              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Widget Title
                  </label>
                  <input
                    type="text"
                    value={config.title}
                    onChange={(e) => setConfig(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter widget title"
                  />
                </div>

                {/* Stock symbols for table and cards */}
                {(selectedType === 'stock-table' || selectedType === 'finance-card') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Stock Symbols
                    </label>
                    <input
                      type="text"
                      value={config.symbols}
                      onChange={(e) => setConfig(prev => ({ ...prev, symbols: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., AAPL, MSFT, GOOGL"
                    />
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Enter stock symbols separated by commas
                    </p>
                  </div>
                )}

                {/* Single symbol for charts */}
                {selectedType === 'line-chart' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Stock Symbol
                    </label>
                    <input
                      type="text"
                      value={config.symbol}
                      onChange={(e) => setConfig(prev => ({ ...prev, symbol: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., AAPL"
                    />
                  </div>
                )}

                {/* Finance card variant */}
                {selectedType === 'finance-card' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Card Type
                    </label>
                    <select
                      value={config.variant}
                      onChange={(e) => setConfig(prev => ({ ...prev, variant: e.target.value as FinanceCardVariant }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {FINANCE_CARD_VARIANTS.map((variant) => (
                        <option key={variant.value} value={variant.value}>
                          {variant.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Chart period */}
                {selectedType === 'line-chart' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Default Period
                    </label>
                    <select
                      value={config.period}
                      onChange={(e) => setConfig(prev => ({ ...prev, period: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="1D">1 Day</option>
                      <option value="1W">1 Week</option>
                      <option value="1M">1 Month</option>
                      <option value="3M">3 Months</option>
                      <option value="1Y">1 Year</option>
                    </select>
                  </div>
                )}

                {/* Table page size */}
                {selectedType === 'stock-table' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Rows Per Page
                    </label>
                    <select
                      value={config.pageSize}
                      onChange={(e) => setConfig(prev => ({ ...prev, pageSize: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={onClose}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddWidget}
                  disabled={!config.title.trim()}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Widget
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WidgetLibrary;