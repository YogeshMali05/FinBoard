# Financial Dashboard

A customizable, real-time finance dashboard built with Next.js 14, featuring drag-and-drop widgets, Alpha Vantage API integration, and persistent storage.

## Features

✅ **Real-time Financial Data** - Connect to Alpha Vantage API for live stock prices
✅ **Drag & Drop Widgets** - Customizable dashboard layout with beautiful DnD
✅ **Multiple Widget Types** - Stock tables, finance cards, and interactive charts
✅ **Dark/Light Theme** - Seamless theme switching with persistence  
✅ **Data Persistence** - Local storage with export/import functionality
✅ **Responsive Design** - Works perfectly on desktop and mobile
✅ **Rate Limiting** - Smart API request management and caching
✅ **Error Handling** - Comprehensive error states and retry mechanisms

## Widget Types

### 📊 Stock Table
- Paginated stock data with search and filtering
- Real-time price updates every 30 seconds
- Sortable columns and customizable page sizes

### 💰 Finance Cards  
- Compact views for watchlists, market gainers, performance data
- Multiple card variants (Watchlist, Gainers, Performance, Market Overview)
- Clean, responsive card layouts

### 📈 Line Charts
- Interactive price charts with multiple time periods (1D, 1W, 1M, 3M, 1Y)
- Intraday and daily data visualization using Recharts
- Hover tooltips with detailed information

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Alpha Vantage API key (free at https://www.alphavantage.co/support/#api-key)

### Installation

1. **Clone and install dependencies:**
```bash
npx create-next-app@latest financial-dashboard
cd financial-dashboard

# Copy all the files from this package into your project directory
# Then install dependencies:
npm install
```

2. **Set up environment variables:**
```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local and add your Alpha Vantage API key:
ALPHA_VANTAGE_API_KEY=your_api_key_here
```

3. **Start the development server:**
```bash
npm run dev
```

4. **Open your browser:**
Navigate to `http://localhost:3000` to see the application.

## Project Structure

```
financial-dashboard/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── dashboard/          # Dashboard page
│   │   ├── globals.css         # Global styles
│   │   ├── layout.tsx          # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # React components
│   │   ├── providers/         # Context providers
│   │   └── widgets/           # Widget components
│   ├── lib/                   # Utilities and API
│   │   ├── alphaVantageAPI.ts # Alpha Vantage integration
│   │   └── utils.ts           # Utility functions
│   ├── stores/                # Zustand state management
│   │   └── dashboardStore.ts  # Dashboard store
│   └── types/                 # TypeScript definitions
│       ├── financial.ts       # Financial data types
│       └── widget.ts          # Widget types
├── public/                    # Static assets
├── .env.example              # Environment variables template
├── next.config.js            # Next.js configuration
├── tailwind.config.js        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies
```

## Usage Guide

### Adding Widgets

1. **Enter Edit Mode**: Click the "Edit" button in the top navigation
2. **Add Widget**: Click "Add Widget" to open the widget library
3. **Choose Type**: Select from Stock Table, Finance Card, or Line Chart
4. **Configure**: Enter title, stock symbols, and other settings
5. **Add**: Click "Add Widget" to create your widget

### Managing Widgets

- **Reorder**: Drag and drop widgets while in edit mode
- **Configure**: Click the settings icon on any widget  
- **Remove**: Click the trash icon to delete widgets
- **Exit Edit**: Click "Exit Edit" to return to view mode

### Data Management

- **Export**: Use "More" → "Export Dashboard" to download your configuration
- **Import**: Use "More" → "Import Dashboard" to load a saved configuration
- **Clear**: Use "More" → "Clear All" to remove all widgets

## API Configuration

### Alpha Vantage Setup

1. Visit https://www.alphavantage.co/support/#api-key
2. Sign up for a free account
3. Copy your API key to `.env.local`

**Free Tier Limits:**
- 25 requests per day
- 5 requests per minute

The app includes intelligent rate limiting and caching to maximize your API usage.

### Supported Endpoints

- **GLOBAL_QUOTE** - Real-time stock quotes
- **TIME_SERIES_INTRADAY** - Intraday price data  
- **TIME_SERIES_DAILY** - Daily historical data
- **TOP_GAINERS_LOSERS** - Market movers
- **SYMBOL_SEARCH** - Stock symbol search

## Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production  
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with dark mode support
- **State Management**: Zustand with persistence
- **Charts**: Recharts for data visualization  
- **Drag & Drop**: react-beautiful-dnd
- **Icons**: Lucide React
- **Notifications**: react-hot-toast

### Key Features Implementation

**Rate Limiting**: Smart request queuing prevents API limit exceeded errors
**Caching**: Intelligent response caching reduces redundant API calls
**Error Handling**: Comprehensive error states with retry mechanisms
**Persistence**: Automatic local storage with manual export/import
**Responsive**: Mobile-first design with responsive breakpoints

## Deployment

### Vercel (Recommended)

1. **Push to GitHub**: Commit your code to a GitHub repository
2. **Connect to Vercel**: Import your repository at https://vercel.com
3. **Add Environment Variables**: Add your `ALPHA_VANTAGE_API_KEY`
4. **Deploy**: Vercel will automatically build and deploy

### Environment Variables for Production

```bash
ALPHA_VANTAGE_API_KEY=your_production_api_key
```

### Other Platforms

The app works on any platform that supports Next.js:
- Netlify
- Railway  
- AWS Amplify
- DigitalOcean App Platform

## Troubleshooting

### Common Issues

**API Errors**: 
- Check your API key in `.env.local`
- Verify you haven't exceeded rate limits
- Ensure symbols are valid (e.g., AAPL, MSFT, GOOGL)

**Build Errors**:
- Delete `.next` folder and `node_modules`
- Run `npm install` again
- Check for TypeScript errors

**Styling Issues**:
- Ensure Tailwind CSS is properly configured
- Check that `globals.css` imports are correct

### Getting Help

1. Check the browser console for detailed error messages
2. Verify your Alpha Vantage API key is working
3. Test with common stock symbols like AAPL, MSFT, GOOGL
4. Review the network tab for failed API requests

## License

MIT License - feel free to use this project for learning or commercial purposes.

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

---

**Built with ❤️ using Next.js, TypeScript, and Alpha Vantage API**