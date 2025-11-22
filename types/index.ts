export interface Item {
  id: string;
  name: string;
  category: string;
  stock: number;
  location: string;
  condition: 'baik' | 'rusak' | 'perlu_perbaikan';
  description: string;
  image_data?: string;
  created_at: string;
  updated_at: string;
}

export interface BorrowRecord {
  id: string;
  item_id: string;
  item_name: string;
  borrower_name: string;
  quantity: number;
  borrow_date: string;
  return_date: string;
  actual_return_date?: string;
  notes?: string;
  status: 'dipinjam' | 'dikembalikan' | 'terlambat' | 'dibatalkan';
  created_by?: string;
  verified_by?: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'staff';
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  totalItems: number;
  totalBorrowed: number;
  damagedItems: number;
  totalUsers: number;
}