import { create } from 'zustand';
import { Item } from '../types';
import { itemService } from 'config/database';

interface ItemState {
  items: Item[];
  selectedItem: Item | null;
  loading: boolean;
  error: string | null;
  setItems: (items: Item[]) => void;
  addItem: (item: Item) => void;
  updateItem: (id: string, item: Partial<Item>) => void;
  deleteItem: (id: string) => void;
  setSelectedItem: (item: Item | null) => void;
  fetchItems: () => Promise<void>;
  fetchItemById: (id: string) => Promise<Item | null>;
  createItem: (item: Omit<Item, 'id' | 'created_at' | 'updated_at'>) => Promise<Item>;
  clearError: () => void;
}

export const useItemStore = create<ItemState>((set, get) => ({
  items: [],
  selectedItem: null,
  loading: false,
  error: null,

  setItems: (items) => set({ items }),
  
  addItem: (item) => set((state) => ({
    items: [...state.items, item]
  })),
  
  updateItem: (id, updatedItem) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, ...updatedItem } : item
      ),
    })),
  
  deleteItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),
  
  setSelectedItem: (item) => set({ selectedItem: item }),

  fetchItems: async () => {
    if (get().loading) return;
  
    set({ loading: true, error: null });
    try {
      const items = await itemService.getAllItems();
      set({ items, loading: false });
    } catch (error) {
      console.error('Error fetching items:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch items',
        loading: false
      });
    }
  },

  fetchItemById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const item = await itemService.getItemById(id);
      set({ loading: false });
      return item;
    } catch (error) {
      console.error('Error fetching item:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch item',
        loading: false
      });
      return null;
    }
  },

  createItem: async (itemData) => {
    set({ loading: true, error: null });
    try {
      const newItem = await itemService.createItem(itemData);
      if (!newItem) {
        throw new Error('Failed to create item');
      }
    
      set((state) => ({
        items: [...state.items, newItem],
        loading: false
      }));
      return newItem;
    } catch (error) {
      console.error('Error creating item:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to create item',
        loading: false
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));