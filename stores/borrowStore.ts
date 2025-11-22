// app/stores/borrowStore.ts
import { create } from 'zustand';
import { BorrowRecord } from '../types';

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
  createRecord: (record: Omit<BorrowRecord, 'id' | 'created_at' | 'updated_at' | 'item_name'>) => Promise<BorrowRecord>;
  fetchRecordsByItemId: (itemId: string) => Promise<BorrowRecord[]>;
  clearError: () => void;
}

export const useBorrowStore = create<BorrowState>((set, get) => ({
  records: [],
  loading: false,
  error: null,
  
  setRecords: (records) => set({ records }),
  
  addRecord: (record) => set((state) => ({ records: [...state.records, record] })),
  
  updateRecord: (id, updatedRecord) =>
    set((state) => ({
      records: state.records.map((record) =>
        record.id === id ? { ...record, ...updatedRecord } : record
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
        throw new Error('Failed to fetch borrow records');
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
    set({ loading: true, error: null });
    try {
      const response = await fetch(`/api/borrow/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch borrow record');
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

  createRecord: async (recordData) => {
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
        throw new Error(errorData.error || 'Failed to create borrow record');
      }

      const newRecord = await response.json();
      
      set((state) => ({ 
        records: [...state.records, newRecord],
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
    set({ loading: true, error: null });
    try {
      const allRecords = await get().fetchRecords();
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

  clearError: () => set({ error: null }),
}));