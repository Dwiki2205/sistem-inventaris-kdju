// stores/itemStore.ts
import { create } from 'zustand';
import { Item } from '../types';

interface ItemState {
  items: Item[];
  selectedItem: Item | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  setItems: (items: Item[]) => void;
  addItem: (item: Item) => void;
  updateItem: (id: string, item: Partial<Item>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
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
    items: [item, ...state.items]
  })),
  
  updateItem: async (id: string, updatedItem: Partial<Item>) => {
    console.log('Store: Updating item', id, updatedItem);
    
    set({ loading: true, error: null });
    
    try {
      // Optimistic update
      const currentItems = get().items;
      const itemToUpdate = currentItems.find(item => item.id === id);
      
      if (!itemToUpdate) {
        throw new Error('Item not found in local state');
      }

      // Update local state optimistically
      set((state) => ({
        items: state.items.map((item) =>
          item.id === id ? { ...item, ...updatedItem } : item
        ),
        selectedItem: state.selectedItem?.id === id 
          ? { ...state.selectedItem, ...updatedItem }
          : state.selectedItem,
      }));

      // API call
      const response = await fetch(`/api/items/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedItem),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to update item: ${response.status}`);
      }

      const updatedItemFromServer = await response.json();
      
      // Update with server data
      set((state) => ({
        items: state.items.map((item) =>
          item.id === id ? { ...item, ...updatedItemFromServer } : item
        ),
        selectedItem: state.selectedItem?.id === id 
          ? updatedItemFromServer
          : state.selectedItem,
        loading: false,
      }));

      console.log('Store: Item updated successfully');
      
    } catch (error) {
      console.error('Store: Error updating item:', error);
      
      // Rollback optimistic update
      const currentItems = get().items;
      set({
        items: currentItems, // Reset to previous state
        error: error instanceof Error ? error.message : 'Failed to update item',
        loading: false,
      });
      
      throw error;
    }
  },
  
  deleteItem: async (id: string) => {
    set({ loading: true, error: null });
    
    try {
      const response = await fetch(`/api/items/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to delete item: ${response.status}`);
      }

      set((state) => ({
        items: state.items.filter((item) => item.id !== id),
        selectedItem: state.selectedItem?.id === id ? null : state.selectedItem,
        loading: false,
      }));
      
    } catch (error) {
      console.error('Error deleting item:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to delete item',
        loading: false,
      });
      throw error;
    }
  },
  
  setSelectedItem: (item) => set({ selectedItem: item }),

  fetchItems: async () => {
    if (get().loading) return;
  
    set({ loading: true, error: null });
    
    try {
      const response = await fetch('/api/items');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch items: ${response.status}`);
      }
      
      const items = await response.json();
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
    if (!id) {
      console.error('Store: No ID provided for fetchItemById');
      return null;
    }
    
    set({ loading: true, error: null });
    
    try {
      // Check local cache first
      const cachedItem = get().items.find(item => item.id === id);
      if (cachedItem) {
        console.log('Store: Found item in cache', cachedItem);
        set({ loading: false });
        return cachedItem;
      }

      // Fetch from API
      console.log('Store: Fetching item from API', id);
      const response = await fetch(`/api/items/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Item not found');
        }
        throw new Error(`Failed to fetch item: ${response.status}`);
      }
      
      const item = await response.json();
      console.log('Store: Fetched item', item);
      
      set({ loading: false });
      return item;
      
    } catch (error) {
      console.error('Store: Error fetching item:', error);
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
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to create item: ${response.status}`);
      }

      const newItem = await response.json();
      
      if (!newItem) {
        throw new Error('Failed to create item - no data returned');
      }
    
      set((state) => ({
        items: [newItem, ...state.items],
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