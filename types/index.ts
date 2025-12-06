// types/index.ts
export interface Item {
  id: string;
  name: string;
  category: string;
  stock: number;
  location: string;
  condition: 'baik' | 'rusak' | 'perlu_perbaikan';
  description: string;
  image_data?: string;
  created_at: Date | string;  // Perbaiki tipe ini
  updated_at: Date | string;  // Perbaiki tipe ini
}

export interface BorrowRecord {
  id: string;
  item_id: string;
  item_name: string;
  borrower_name: string;
  quantity: number;
  borrow_date: Date | string;  // Perbaiki tipe ini
  return_date: Date | string;  // Perbaiki tipe ini
  actual_return_date?: Date | string;  // Perbaiki tipe ini
  notes?: string;
  status: 'dipinjam' | 'dikembalikan' | 'terlambat' | 'dibatalkan';
  created_by?: string;
  verified_by?: string;
  created_at: Date | string;  // Perbaiki tipe ini
  updated_at: Date | string;  // Perbaiki tipe ini
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'staff';
  created_at: Date | string;  // Perbaiki tipe ini
  updated_at: Date | string;  // Perbaiki tipe ini
}

export interface DashboardStats {
  totalItems: number;
  totalBorrowed: number;
  damagedItems: number;
  totalUsers: number;
}

// Atau jika Anda ingin tetap menggunakan string, ubah transform function