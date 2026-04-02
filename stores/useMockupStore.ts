"use client";
import { create } from "zustand";

export type DesignLayer = {
  id: string;
  type: "image" | "text";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
  src?: string;        // for image layers
  text?: string;       // for text layers
  fontSize?: number;
  fontFamily?: string;
  fill?: string;
  isSelected: boolean;
};

type MockupState = {
  productId: string;
  colourId: string;
  side: "front" | "back";
  selectedSize: string;
  layers: DesignLayer[];
  selectedLayerId: string | null;
  history: DesignLayer[][];
  historyIndex: number;
  sessionToken: string | null;
  sessionId: string | null;
  isSaving: boolean;
  isExporting: boolean;

  setProduct: (productId: string, colourId: string) => void;
  setColour: (colourId: string) => void;
  setSide: (side: "front" | "back") => void;
  setSelectedSize: (size: string) => void;
  addLayer: (layer: DesignLayer) => void;
  updateLayer: (id: string, updates: Partial<DesignLayer>) => void;
  removeLayer: (id: string) => void;
  selectLayer: (id: string | null) => void;
  reorderLayers: (layers: DesignLayer[]) => void;
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;
  clearCanvas: () => void;
  setSessionToken: (token: string) => void;
  setSessionId: (id: string) => void;
  setIsSaving: (v: boolean) => void;
  setIsExporting: (v: boolean) => void;
};

export const useMockupStore = create<MockupState>((set, get) => ({
  productId: "prod-1",
  colourId: "c1-1",
  side: "front",
  selectedSize: "M",
  layers: [],
  selectedLayerId: null,
  history: [[]],
  historyIndex: 0,
  sessionToken: null,
  sessionId: null,
  isSaving: false,
  isExporting: false,

  setProduct: (productId, colourId) => set({ productId, colourId, layers: [], selectedLayerId: null }),
  setColour: (colourId) => set({ colourId }),
  setSide: (side) => set({ side }),
  setSelectedSize: (selectedSize) => set({ selectedSize }),

  addLayer: (layer) => {
    get().pushHistory();
    set((s) => ({ layers: [...s.layers, layer], selectedLayerId: layer.id }));
  },

  updateLayer: (id, updates) =>
    set((s) => ({
      layers: s.layers.map((l) => (l.id === id ? { ...l, ...updates } : l)),
    })),

  removeLayer: (id) => {
    get().pushHistory();
    set((s) => ({
      layers: s.layers.filter((l) => l.id !== id),
      selectedLayerId: s.selectedLayerId === id ? null : s.selectedLayerId,
    }));
  },

  selectLayer: (id) =>
    set((s) => ({
      layers: s.layers.map((l) => ({ ...l, isSelected: l.id === id })),
      selectedLayerId: id,
    })),

  reorderLayers: (layers) => set({ layers }),

  pushHistory: () =>
    set((s) => {
      const newHistory = s.history.slice(0, s.historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(s.layers)));
      return { history: newHistory.slice(-20), historyIndex: newHistory.length - 1 };
    }),

  undo: () =>
    set((s) => {
      if (s.historyIndex <= 0) return s;
      const idx = s.historyIndex - 1;
      return { layers: JSON.parse(JSON.stringify(s.history[idx])), historyIndex: idx, selectedLayerId: null };
    }),

  redo: () =>
    set((s) => {
      if (s.historyIndex >= s.history.length - 1) return s;
      const idx = s.historyIndex + 1;
      return { layers: JSON.parse(JSON.stringify(s.history[idx])), historyIndex: idx, selectedLayerId: null };
    }),

  clearCanvas: () => {
    get().pushHistory();
    set({ layers: [], selectedLayerId: null });
  },

  setSessionToken: (token) => set({ sessionToken: token }),
  setSessionId: (id) => set({ sessionId: id }),
  setIsSaving: (v) => set({ isSaving: v }),
  setIsExporting: (v) => set({ isExporting: v }),
}));
