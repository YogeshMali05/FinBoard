'use client';

import React, { useState, useEffect } from 'react';
import { useDashboardStore } from '@/stores/dashboardStore';
import { useTheme } from '@/components/providers/ThemeProvider';
import DragContainer from '@/components/widgets/DragContainer';
import WidgetLibrary from '@/components/widgets/WidgetLibrary';
import {
  Settings,
  Plus,
  Moon,
  Sun,
  Home,
  RefreshCw,
} from 'lucide-react';
import { Widget } from '@/types/widget';
import toast from 'react-hot-toast';
import Link from 'next/link';

const DashboardPage = () => {
  const {
    widgets,
    isEditMode,
    theme,
    addWidget,
    clearDashboard,
    setEditMode,
    exportDashboard,
    importDashboard,
  } = useDashboardStore();

  const { toggleTheme } = useTheme();
  const [showWidgetLibrary, setShowWidgetLibrary] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const handleAddWidget = (widget: Widget) => {
    addWidget(widget);
    setShowWidgetLibrary(false);
    toast.success(`${widget.title} added successfully!`);
  };

  const handleClearDashboard = () => {
    if (window.confirm('Are you sure you want to clear all widgets? This action cannot be undone.')) {
      clearDashboard();
      toast.success('Dashboard cleared');
    }
  };

  const handleExportDashboard = () => {
    try {
      const data = exportDashboard();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `finance-dashboard-${new Date().getTime()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Dashboard exported successfully!');
    } catch {
      toast.error('Failed to export dashboard');
    }
  };

  const handleImportDashboard = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result as string;
        importDashboard(data);
        toast.success('Dashboard imported successfully!');
      } catch {
        toast.error('Failed to import dashboard. Please check the file format.');
      }
    };
    reader.readAsText(file);
    // Reset input
    event.target.value = '';
  };

  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
    toast.success('All widgets refreshed');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Left section */}
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <Home className="w-5 h-5" />
                <span className="text-sm font-medium">Home</span>
              </Link>
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Finance Dashboard
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {widgets.length} {widgets.length === 1 ? 'widget' : 'widgets'} • {isEditMode ? 'Edit Mode' : 'View Mode'}
                </p>
              </div>
            </div>

            {/* Right section */}
            <div className="flex items-center space-x-2">
              {/* Refresh */}
              <button
                onClick={handleRefreshAll}
                disabled={isRefreshing}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
                title="Refresh all widgets"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                title="Toggle theme"
              >
                {theme === 'light' ? (
                  <Moon className="w-4 h-4" />
                ) : (
                  <Sun className="w-4 h-4" />
                )}
              </button>

              {/* Edit mode toggle */}
              <button
                onClick={() => setEditMode(!isEditMode)}
                className={`px-3 py-2 rounded-lg font-medium transition-colors ${
                  isEditMode
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Settings className="w-4 h-4 inline mr-2" />
                {isEditMode ? 'Exit Edit' : 'Edit'}
              </button>

              {/* Add widget */}
              <button
                onClick={() => setShowWidgetLibrary(true)}
                className="btn-primary"
                disabled={!isEditMode}
              >
                <Plus className="w-4 h-4 inline mr-2" />
                Add Widget
              </button>

              {/* More actions */}
              <div className="relative">
                <select
                  className="appearance-none bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm pr-8"
                  onChange={(e) => {
                    const action = e.target.value;
                    if (action === 'export') {
                      handleExportDashboard();
                    } else if (action === 'import') {
                      document.getElementById('import-input')?.click();
                    } else if (action === 'clear') {
                      handleClearDashboard();
                    }
                    e.target.value = ''; // Reset
                  }}
                >
                  <option value="">More</option>
                  <option value="export">Export Dashboard</option>
                  <option value="import">Import Dashboard</option>
                  {widgets.length > 0 && <option value="clear">Clear All</option>}
                </select>
                <input
                  id="import-input"
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImportDashboard}
                />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {widgets.length === 0 ? (
          /* Empty state */
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <Plus className="w-12 h-12 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-2xl font-medium text-gray-900 dark:text-white mb-2">
                No widgets yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-8 text-lg">
                Get started by adding your first widget to track financial data in real-time.
              </p>
              <button
                onClick={() => {
                  if (!isEditMode) setEditMode(true);
                  setShowWidgetLibrary(true);
                }}
                className="btn-primary text-lg px-8 py-3"
              >
                <Plus className="w-5 h-5 inline mr-2" />
                Add Your First Widget
              </button>

              {/* Sample widgets preview */}
              <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4 opacity-60">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-4 h-4 bg-blue-500 rounded"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-3"></div>
                  <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20 mb-3"></div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                      <div className="h-3 bg-green-200 dark:bg-green-800 rounded w-12"></div>
                    </div>
                    <div className="flex justify-between">
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                      <div className="h-3 bg-red-200 dark:bg-red-800 rounded w-12"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Dashboard grid */
          <DragContainer />
        )}

        {/* Widget Library Modal */}
        {showWidgetLibrary && (
          <WidgetLibrary
            onAddWidget={handleAddWidget}
            onClose={() => setShowWidgetLibrary(false)}
          />
        )}

        {/* Edit mode hint */}
        {isEditMode && widgets.length > 0 && (
          <div className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-lg shadow-lg max-w-xs z-40">
            <div className="flex items-start space-x-3">
              <Settings className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Edit Mode Active</p>
                <p className="text-xs opacity-90 mt-1">
                  Drag widgets to reorder • Click settings to configure • Click trash to remove
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;