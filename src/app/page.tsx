import Link from 'next/link';
import { ArrowRight, BarChart3, TrendingUp, Shield } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="pt-8 pb-16">
          <nav className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                FinBoard
              </h1>
            </div>
            <Link
              href="/dashboard"
              className="btn-primary"
            >
              Open Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </nav>
        </header>

        {/* Hero Section */}
        <main>
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Build Your Perfect{' '}
              <span className="text-blue-600">Finance Dashboard</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Create customizable widgets, track real-time financial data, and build 
              the dashboard that fits your investment strategy. Drag, drop, and configure 
              your way to better financial insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/dashboard"
                className="btn-primary text-lg px-8 py-4"
              >
                Start Building
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                href="#features"
                className="btn-secondary text-lg px-8 py-4"
              >
                Learn More
              </Link>
            </div>
          </div>

          {/* Features Section */}
          <section id="features" className="mt-24">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
              Powerful Features
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Real-time Data
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Connect to Alpha Vantage API for live stock prices, market data, 
                  and financial metrics updated in real-time.
                </p>
              </div>
              
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Drag & Drop Widgets
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Customize your dashboard with draggable widgets. Tables, charts, 
                  cards, and more - arrange them however you want.
                </p>
              </div>
              
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Persistent Storage
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Your dashboard configuration is saved locally. Export and import 
                  configurations to share or backup your setup.
                </p>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="mt-24 text-center">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Ready to get started?
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Create your first dashboard in minutes. No sign-up required.
              </p>
              <Link
                href="/dashboard"
                className="btn-primary text-lg px-8 py-4"
              >
                Launch Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="mt-24 pb-8 text-center text-gray-500 dark:text-gray-400">
          <p>&copy; 2024 FinBoard. Built with Next.js and Alpha Vantage API.</p>
        </footer>
      </div>
    </div>
  );
}