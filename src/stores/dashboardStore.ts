import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Widget, DashboardState } from '@/types/widget';

interface DashboardStore extends DashboardState {
  // Actions
  addWidget: (widget: Widget) => void;
  removeWidget: (id: string) => void;
  updateWidget: (id: string, updates: Partial<Widget>) => void;
  reorderWidgets: (widgets: Widget[]) => void;
  setEditMode: (isEdit: boolean) => void;
  setSelectedWidget: (id: string | null) => void;
  setDragging: (isDragging: boolean) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  clearDashboard: () => void;
  exportDashboard: () => string;
  importDashboard: (data: string) => void;
}

export const useDashboardStore = create<DashboardStore>()(
  persist(
    (set, get) => ({
      // Initial state
      widgets: [],
      isEditMode: false,
      selectedWidget: null,
      isDragging: false,
      theme: 'light',

      // Actions
      addWidget: (widget: Widget) =>
        set((state) => ({
          widgets: [...state.widgets, widget],
        })),

      removeWidget: (id: string) =>
        set((state) => ({
          widgets: state.widgets.filter((w) => w.id !== id),
          selectedWidget: state.selectedWidget === id ? null : state.selectedWidget,
        })),

      updateWidget: (id: string, updates: Partial<Widget>) =>
        set((state) => ({
          widgets: state.widgets.map((w) =>
            w.id === id ? { ...w, ...updates, updatedAt: Date.now() } : w
          ),
        })),

      reorderWidgets: (widgets: Widget[]) =>
        set({ widgets }),

      setEditMode: (isEditMode: boolean) =>
        set({ isEditMode, selectedWidget: isEditMode ? get().selectedWidget : null }),

      setSelectedWidget: (selectedWidget: string | null) =>
        set({ selectedWidget }),

      setDragging: (isDragging: boolean) =>
        set({ isDragging }),

      setTheme: (theme: 'light' | 'dark') => {
        set({ theme });
        // Apply theme to document
        if (typeof window !== 'undefined') {
          const root = window.document.documentElement;
          if (theme === 'dark') {
            root.classList.add('dark');
          } else {
            root.classList.remove('dark');
          }
        }
      },

      clearDashboard: () =>
        set({
          widgets: [],
          selectedWidget: null,
        }),

      exportDashboard: () => {
        const state = get();
        return JSON.stringify({
          widgets: state.widgets,
          theme: state.theme,
          exportedAt: new Date().toISOString(),
        });
      },

      importDashboard: (data: string) => {
        try {
          const imported = JSON.parse(data);
          if (imported.widgets && Array.isArray(imported.widgets)) {
            set({
              widgets: imported.widgets,
              theme: imported.theme || 'light',
            });
          }
        } catch (error) {
          console.error('Failed to import dashboard:', error);
        }
      },
    }),
    {
      name: 'finance-dashboard',
      partialize: (state) => ({
        widgets: state.widgets,
        theme: state.theme,
      }),
    }
  )
);