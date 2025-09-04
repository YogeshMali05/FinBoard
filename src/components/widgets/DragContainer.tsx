'use client';

import React from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useDashboardStore } from '@/stores/dashboardStore';
import { Widget } from '@/types/widget';
import StockTable from '@/components/widgets/StockTable';
import FinanceCard from '@/components/widgets/FinanceCard';
import LineChart from '@/components/widgets/LineChart';
import { Trash2, Settings } from 'lucide-react';

interface DragContainerProps {
  children?: React.ReactNode;
}

const DragContainer: React.FC<DragContainerProps> = ({ children }) => {
  const {
    widgets,
    isEditMode,
    selectedWidget,
    reorderWidgets,
    setSelectedWidget,
    removeWidget,
  } = useDashboardStore();

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    reorderWidgets(items);
  };

  const renderWidget = (widget: Widget) => {
    // Remove key from baseProps and handle it separately
    const baseProps = {
      widgetId: widget.id,
    };

    switch (widget.type) {
      case 'stock-table':
        return (
          <StockTable
            key={widget.id}
            {...baseProps}
            symbols={widget.config?.symbols || []}
            title={widget.title}
            pageSize={widget.config?.pageSize || 10}
          />
        );

      case 'finance-card':
        return (
          <FinanceCard
            key={widget.id}
            {...baseProps}
            variant={widget.config?.variant || 'watchlist'}
            title={widget.title}
            symbols={widget.config?.symbols || []}
          />
        );

      case 'line-chart':
        return (
          <LineChart
            key={widget.id}
            {...baseProps}
            symbol={widget.config?.symbol || 'AAPL'}
            title={widget.title}
            period={widget.config?.period || '1D'}
          />
        );

      default:
        return (
          <div key={widget.id} className="widget-container">
            <p>Unknown widget type: {widget.type}</p>
          </div>
        );
    }
  };

  if (!isEditMode) {
    // Static grid layout when not in edit mode
    return (
      <div className="dashboard-grid">
        {widgets.map((widget) => (
          <div
            key={widget.id}
            className="widget-wrapper animate-fade-in"
            onClick={() => setSelectedWidget(widget.id)}
          >
            {renderWidget(widget)}
          </div>
        ))}
        {children}
      </div>
    );
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="dashboard-grid" direction="horizontal">
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`dashboard-grid ${
              snapshot.isDraggingOver ? 'bg-blue-50 dark:bg-blue-900/10 rounded-lg' : ''
            }`}
          >
            {widgets.map((widget, index) => (
              <Draggable
                key={widget.id}
                draggableId={widget.id}
                index={index}
                isDragDisabled={!isEditMode}
              >
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`widget-wrapper relative ${
                      snapshot.isDragging ? 'opacity-75 rotate-2 shadow-xl z-50' : ''
                    } ${
                      selectedWidget === widget.id 
                        ? 'ring-2 ring-blue-500 ring-opacity-75' 
                        : ''
                    }`}
                    style={{
                      ...provided.draggableProps.style,
                    }}
                    onClick={() => setSelectedWidget(widget.id)}
                  >
                    {/* Edit mode overlay */}
                    {isEditMode && (
                      <div className="absolute top-2 right-2 z-10 flex space-x-1">
                        <button
                          className="p-1.5 bg-white dark:bg-gray-800 shadow-md rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            // TODO: Open configuration panel
                            console.log('Configure widget:', widget.id);
                          }}
                          title="Configure widget"
                        >
                          <Settings className="w-3.5 h-3.5" />
                        </button>
                        <button
                          className="p-1.5 bg-white dark:bg-gray-800 shadow-md rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm('Are you sure you want to remove this widget?')) {
                              removeWidget(widget.id);
                            }
                          }}
                          title="Remove widget"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {/* Drag handle indicator */}
                    {isEditMode && !snapshot.isDragging && (
                      <div className="absolute top-2 left-2 opacity-50 hover:opacity-75 transition-opacity">
                        <div className="grid grid-cols-2 gap-0.5">
                          {[...Array(6)].map((_, i) => (
                            <div
                              key={i}
                              className="w-1.5 h-1.5 bg-gray-400 dark:bg-gray-500 rounded-full"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {renderWidget(widget)}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
            {children}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default DragContainer;