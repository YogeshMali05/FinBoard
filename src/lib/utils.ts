// Format currency values
export const formatCurrency = (value: number, decimals: number = 2): string => {
  if (isNaN(value)) return '$0.00';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

// Format percentage values
export const formatPercentage = (value: number, decimals: number = 2): string => {
  if (isNaN(value)) return '0.00%';
  
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
};

// Format large numbers (e.g., volume, market cap)
export const formatNumber = (value: number): string => {
  if (isNaN(value)) return '0';
  
  if (value >= 1e12) {
    return `${(value / 1e12).toFixed(2)}T`;
  } else if (value >= 1e9) {
    return `${(value / 1e9).toFixed(2)}B`;
  } else if (value >= 1e6) {
    return `${(value / 1e6).toFixed(2)}M`;
  } else if (value >= 1e3) {
    return `${(value / 1e3).toFixed(1)}K`;
  }
  
  return value.toLocaleString();
};

// Format date for different contexts
export const formatDate = (date: string | Date, format: 'short' | 'long' | 'time' = 'long'): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) return 'Invalid Date';
  
  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    case 'time':
      return dateObj.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    default:
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
  }
};

// Format change values with proper styling classes
export const formatChange = (change: number, changePercent: number) => {
  const isPositive = change >= 0;
  const colorClass = isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  const sign = isPositive ? '+' : '';
  
  return {
    change: `${sign}${formatCurrency(change)}`,
    changePercent: `${sign}${formatPercentage(changePercent)}`,
    colorClass,
    isPositive,
  };
};

// Debounce function for search inputs
export const debounce = <T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Generate unique IDs
export const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

// Validate stock symbol
export const isValidSymbol = (symbol: string): boolean => {
  // Basic validation: 1-5 uppercase letters, optionally followed by a dot and more letters
  const symbolRegex = /^[A-Z]{1,5}(\.[A-Z]{1,3})?$/;
  return symbolRegex.test(symbol.toUpperCase());
};

// Get color based on value (for charts)
export const getValueColor = (value: number): string => {
  if (value > 0) return '#10b981'; // green
  if (value < 0) return '#ef4444'; // red
  return '#6b7280'; // gray
};

// Calculate percentage change
export const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
};

// Parse Alpha Vantage percentage string
export const parsePercentageString = (percentStr: string): number => {
  return parseFloat(percentStr.replace('%', ''));
};