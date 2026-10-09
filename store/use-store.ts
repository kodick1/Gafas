"use client";

import { create } from "zustand";

export type ShopFilters = { faceShapes: string[]; materials: string[]; styles: string[]; lensTypes: string[] };
export type ProductPreview = {
  title: string;
  description: string;
  price: number | null;
  stock: number | null;
  category: string;
  material: string;
  images: File[];
};
type StoreState = {
  filters: ShopFilters;
  toggleFilter: (group: keyof ShopFilters, value: string) => void;
  clearFilters: () => void;
  frameMaterial: string;
  frameColor: string;
  lensTint: string;
  engravingText: string;
  setDesign: (key: "frameMaterial" | "frameColor" | "lensTint" | "engravingText", value: string) => void;
  cartCount: number;
  addToCart: () => void;
  productPreview: ProductPreview;
  setProductPreview: (preview: ProductPreview) => void;
  resetProductPreview: () => void;
};

const emptyFilters: ShopFilters = { faceShapes: [], materials: [], styles: [], lensTypes: [] };
const emptyProductPreview: ProductPreview = {
  title: "",
  description: "",
  price: null,
  stock: null,
  category: "sol",
  material: "acetato",
  images: [],
};
export const useStore = create<StoreState>((set) => ({
  filters: emptyFilters,
  toggleFilter: (group, value) => set((state) => {
    const values = state.filters[group];
    return { filters: { ...state.filters, [group]: values.includes(value) ? values.filter((item) => item !== value) : [...values, value] } };
  }),
  clearFilters: () => set({ filters: emptyFilters }),
  frameMaterial: "Acetato",
  frameColor: "Oliva",
  lensTint: "Verde",
  engravingText: "",
  setDesign: (key, value) => set({ [key]: value }),
  cartCount: 0,
  addToCart: () => set((state) => ({ cartCount: state.cartCount + 1 })),
  productPreview: emptyProductPreview,
  setProductPreview: (productPreview) => set({ productPreview }),
  resetProductPreview: () => set({ productPreview: emptyProductPreview }),
}));
