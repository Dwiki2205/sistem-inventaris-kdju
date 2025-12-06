// app/stores/borrowStore.ts
import { create } from 'zustand';
import { BorrowRecord, CreateBorrowRecordInput } from '../types';

interface BorrowState {
  records: BorrowRecord[];
  loading: boolean;
  error: string | null;
  setRecords: (records: BorrowRecord[]) => void;
  addRecord: (record: BorrowRecord) => void;
  updateRecord: (id: string, record: Partial<BorrowRecord>) => void;
  deleteRecord: (id: string) => void;
  fetchRecords: () => Promise<void>;
  fetchRecordById: (id: string) => Promise<BorrowRecord | null>;
  createRecord: (record: CreateBorrowRecordInput) => Promise<BorrowRecord>;
  fetchRecordsByItemId: (itemId: string) => Promise<BorrowRecord[]>;
  fetchRecordsByStatus: (status: string) => Promise<BorrowRecord[]>;
  clearError: () => void;
  clearRecords: () => void;
}

export const useBorrowStore = create<BorrowState>((set, get) => ({
  records: [],
  loading: false,
  error: null,
  
  setRecords: (records) => set({ records }),
  
  addRecord: (record) => set((state) => ({ 
    records: [...state.records, record] 
  })),
  
  updateRecord: (id, updatedRecord) =>
    set((state) => ({
      records: state.records.map((record) =>
        record.id === id ? { ...record, ...updatedRecord, updated_at: new Date().toISOString() } : record
      ),
    })),

  deleteRecord: (id) =>
    set((state) => ({
      records: state.records.filter((record) => record.id !== id),
    })),

  fetchRecords: async () => {
    if (get().loading) return;
    
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/borrow');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch borrow records: ${response.statusText}`);
      }
      
      const records = await response.json();
      set({ records, loading: false });
    } catch (error) {
      console.error('Error fetching borrow records:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch borrow records',
        loading: false
      });
      throw error;
    }
  },

  fetchRecordById: async (id: string) => {
    if (!id) {
      set({ error: 'ID is required' });
      return null;
    }
    
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/borrow/${id}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Borrow record not found');
        }
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch borrow record: ${response.statusText}`);
      }
      
      const record = await response.json();
      set({ loading: false });
      return record;
    } catch (error) {
      console.error('Error fetching borrow record:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch borrow record',
        loading: false
      });
      return null;
    }
  },

  createRecord: async (recordData: CreateBorrowRecordInput) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch('/api/borrow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(recordData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to create borrow record: ${response.statusText}`);
      }

      const newRecord = await response.json();
      
      // Tambahkan record ke state
      set((state) => ({ 
        records: [newRecord, ...state.records],
        loading: false 
      }));
      
      return newRecord;
    } catch (error) {
      console.error('Error creating borrow record:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to create borrow record',
        loading: false
      });
      throw error;
    }
  },

  fetchRecordsByItemId: async (itemId: string) => {
    if (!itemId) {
      set({ error: 'Item ID is required' });
      return [];
    }
    
    set({ loading: true, error: null });
    try {
      // Pertama, fetch semua records
      await get().fetchRecords();
      
      // Filter berdasarkan item_id
      const filteredRecords = get().records.filter(record => record.item_id === itemId);
      set({ loading: false });
      return filteredRecords;
    } catch (error) {
      console.error('Error fetching borrow records by item id:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch borrow records',
        loading: false
      });
      return [];
    }
  },

  fetchRecordsByStatus: async (status: string) => {
    if (!status) {
      set({ error: 'Status is required' });
      return [];
    }
    
    set({ loading: true, error: null });
    try {
      // Pertama, fetch semua records
      await get().fetchRecords();
      
      // Filter berdasarkan status
      const filteredRecords = get().records.filter(record => record.status === status);
      set({ loading: false });
      return filteredRecords;
    } catch (error) {
      console.error('Error fetching borrow records by status:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch borrow records',
        loading: false
      });
      return [];
    }
  },

  clearError: () => set({ error: null }),
  
  clearRecords: () => set({ records: [] }),
}));