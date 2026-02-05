import { create } from "zustand";

export interface UploadTask {
  id: string;
  fileName: string;
  progress: number; // 0-100
  status: "pending" | "uploading" | "done" | "error" | "cancelled";
  errorMessage?: string;
}

export interface SelectedItem {
  id: string;
  type: "file" | "folder";
}

interface AppState {
  // UI
  isSidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;

  // Files
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Detail Panel
  showDetailPanel: boolean;
  setShowDetailPanel: (show: boolean) => void;

  // Selection
  selectedItems: SelectedItem[];
  lastSelectedIndex: number | null;
  toggleSelectItem: (
    item: SelectedItem,
    ctrlKey: boolean,
    shiftKey: boolean,
    allItems: SelectedItem[]
  ) => void;
  setSelectedItems: (items: SelectedItem[]) => void;
  clearSelection: () => void;

  // Upload
  uploadTasks: UploadTask[];
  addUploadTask: (task: UploadTask) => void;
  addUploadTasks: (tasks: UploadTask[]) => void;
  updateUploadTask: (id: string, updates: Partial<UploadTask>) => void;
  removeUploadTask: (id: string) => void;
  clearFinishedUploads: () => void;
  cancelAllUploads: () => void;
  showUploadPanel: boolean;
  setShowUploadPanel: (show: boolean) => void;
}

export const useStore = create<AppState>((set) => ({
  isSidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed }),
  isMobileMenuOpen: false,
  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),

  viewMode: "grid",
  setViewMode: (mode) => set({ viewMode: mode }),
  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),

  // Detail Panel
  showDetailPanel: false,
  setShowDetailPanel: (show) => set({ showDetailPanel: show }),

  // Selection
  selectedItems: [],
  lastSelectedIndex: null,
  toggleSelectItem: (item, ctrlKey, shiftKey, allItems) =>
    set((state) => {
      if (shiftKey && state.lastSelectedIndex !== null) {
        const currentIndex = allItems.findIndex(
          (i) => i.id === item.id && i.type === item.type
        );
        if (currentIndex === -1) return state;
        const start = Math.min(state.lastSelectedIndex, currentIndex);
        const end = Math.max(state.lastSelectedIndex, currentIndex);
        const rangeItems = allItems.slice(start, end + 1);
        // Shift+Click: 기존 선택에 범위 추가
        const merged = [...state.selectedItems];
        for (const ri of rangeItems) {
          if (!merged.some((s) => s.id === ri.id && s.type === ri.type)) {
            merged.push(ri);
          }
        }
        return { selectedItems: merged, lastSelectedIndex: currentIndex };
      }

      if (ctrlKey) {
        const exists = state.selectedItems.some(
          (s) => s.id === item.id && s.type === item.type
        );
        const currentIndex = allItems.findIndex(
          (i) => i.id === item.id && i.type === item.type
        );
        if (exists) {
          return {
            selectedItems: state.selectedItems.filter(
              (s) => !(s.id === item.id && s.type === item.type)
            ),
            lastSelectedIndex: currentIndex,
          };
        }
        return {
          selectedItems: [...state.selectedItems, item],
          lastSelectedIndex: currentIndex,
        };
      }

      // 일반 클릭: 해당 항목만 선택
      const currentIndex = allItems.findIndex(
        (i) => i.id === item.id && i.type === item.type
      );
      return { selectedItems: [item], lastSelectedIndex: currentIndex };
    }),
  setSelectedItems: (items) => set({ selectedItems: items }),
  clearSelection: () => set({ selectedItems: [], lastSelectedIndex: null }),

  // Upload
  uploadTasks: [],
  addUploadTask: (task) =>
    set((state) => ({
      uploadTasks: [...state.uploadTasks, task],
      showUploadPanel: true,
    })),
  addUploadTasks: (tasks) =>
    set((state) => ({
      uploadTasks: [...state.uploadTasks, ...tasks],
      showUploadPanel: true,
    })),
  updateUploadTask: (id, updates) =>
    set((state) => ({
      uploadTasks: state.uploadTasks.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    })),
  removeUploadTask: (id) =>
    set((state) => ({
      uploadTasks: state.uploadTasks.filter((t) => t.id !== id),
    })),
  clearFinishedUploads: () =>
    set((state) => ({
      uploadTasks: state.uploadTasks.filter(
        (t) => t.status === "uploading" || t.status === "pending"
      ),
    })),
  cancelAllUploads: () =>
    set((state) => ({
      uploadTasks: state.uploadTasks.map((t) =>
        t.status === "uploading" || t.status === "pending"
          ? { ...t, status: "cancelled" as const }
          : t
      ),
    })),
  showUploadPanel: false,
  setShowUploadPanel: (show) => set({ showUploadPanel: show }),
}));
