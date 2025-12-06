// lib/database.ts
import { sql } from './db';
import { Item, BorrowRecord, User, DashboardStats } from '../types';

// Helper untuk mengkonversi Date ke string ISO
const formatDateForDB = (date: Date | string | null | undefined): string | null => {
  if (!date) return null;
  if (date instanceof Date) return date.toISOString();
  return date;
};

// Helper functions untuk transform data
const transformItemRow = (row: any): Item => ({
  id: row.id,
  name: row.name,
  category: row.category,
  stock: row.stock,
  location: row.location,
  condition: row.condition,
  description: row.description,
  image_data: row.image_data,
  created_at: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
  updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString()
});

const transformBorrowRow = (row: any): BorrowRecord => ({
  id: row.id,
  item_id: row.item_id,
  item_name: row.item_name,
  borrower_name: row.borrower_name,
  quantity: row.quantity,
  borrow_date: row.borrow_date ? new Date(row.borrow_date).toISOString() : '',
  return_date: row.return_date ? new Date(row.return_date).toISOString() : '',
  actual_return_date: row.actual_return_date ? new Date(row.actual_return_date).toISOString() : undefined,
  status: row.status,
  notes: row.notes,
  created_by: row.created_by,
  verified_by: row.verified_by,
  created_at: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
  updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString()
});

const transformUserRow = (row: any): User => ({
  id: row.id,
  email: row.email,
  name: row.name,
  role: row.role,
  created_at: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
  updated_at: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString()
});

// Item Services
export const itemService = {
  async getAllItems(): Promise<Item[]> {
    try {
      const result = await sql`
        SELECT id, name, category, stock, location, condition, description, image_data, created_at, updated_at
        FROM items
        ORDER BY created_at DESC
      `;
      return result.rows.map(transformItemRow);
    } catch (error) {
      console.error('Error getting all items:', error);
      throw new Error('Failed to fetch items');
    }
  },

  async getItemById(id: string): Promise<Item | null> {
    try {
      console.log('Fetching item with ID:', id);
      
      const result = await sql`
        SELECT id, name, category, stock, location, condition, description, image_data, created_at, updated_at
        FROM items
        WHERE id = ${id}
        LIMIT 1
      `;
    
      if (result.rows.length === 0) {
        console.log('Item not found for ID:', id);
        return null;
      }
      
      const item = transformItemRow(result.rows[0]);
      console.log('Found item:', item);
      return item;
    } catch (error) {
      console.error('Error getting item by id:', error);
      throw new Error('Failed to fetch item');
    }
  },

  async createItem(item: Omit<Item, 'id' | 'created_at' | 'updated_at'>): Promise<Item | null> {
    try {
      const result = await sql`
        INSERT INTO items (name, category, stock, location, condition, description, image_data)
        VALUES (${item.name}, ${item.category}, ${item.stock}, ${item.location}, ${item.condition}, ${item.description}, ${item.image_data})
        RETURNING id, name, category, stock, location, condition, description, image_data, created_at, updated_at
      `;
      return result.rows[0] ? transformItemRow(result.rows[0]) : null;
    } catch (error) {
      console.error('Error creating item:', error);
      throw new Error('Failed to create item');
    }
  },

  async updateItem(id: string, item: Partial<Omit<Item, 'id' | 'created_at' | 'updated_at'>>): Promise<Item | null> {
    try {
      console.log('Updating item with ID:', id);
      console.log('Update data:', item);

      // Build dynamic update query
      const updates: string[] = [];
      const values: any[] = [];

      if (item.name !== undefined) {
        updates.push(`name = $${updates.length + 1}`);
        values.push(item.name);
      }
      if (item.category !== undefined) {
        updates.push(`category = $${updates.length + 1}`);
        values.push(item.category);
      }
      if (item.stock !== undefined) {
        updates.push(`stock = $${updates.length + 1}`);
        values.push(item.stock);
      }
      if (item.location !== undefined) {
        updates.push(`location = $${updates.length + 1}`);
        values.push(item.location);
      }
      if (item.condition !== undefined) {
        updates.push(`condition = $${updates.length + 1}`);
        values.push(item.condition);
      }
      if (item.description !== undefined) {
        updates.push(`description = $${updates.length + 1}`);
        values.push(item.description);
      }
      if (item.image_data !== undefined) {
        updates.push(`image_data = $${updates.length + 1}`);
        values.push(item.image_data);
      }

      // Jika tidak ada data yang diupdate
      if (updates.length === 0) {
        console.log('No fields to update');
        return this.getItemById(id);
      }

      // Tambahkan updated_at
      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      
      // Tambahkan ID untuk WHERE clause
      values.push(id);

      // Build query string untuk sql.query
      const query = `
        UPDATE items 
        SET ${updates.join(', ')}
        WHERE id = $${values.length}
        RETURNING id, name, category, stock, location, condition, description, image_data, created_at, updated_at
      `;

      console.log('Update query:', query);
      console.log('Update values:', values);

      // Gunakan sql.query bukan sql tagged template
      const result = await sql.query(query, values);
      
      if (result.rows.length === 0) {
        console.log('No rows updated, item might not exist');
        return null;
      }
      
      const updatedItem = transformItemRow(result.rows[0]);
      console.log('Successfully updated item:', updatedItem);
      return updatedItem;
    } catch (error) {
      console.error('Error updating item:', error);
      throw new Error('Failed to update item: ' + (error as Error).message);
    }
  },

  async deleteItem(id: string): Promise<boolean> {
    try {
      const result = await sql`
        DELETE FROM items
        WHERE id = ${id}
        RETURNING id
      `;
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error deleting item:', error);
      throw new Error('Failed to delete item');
    }
  },

  async searchItems(query: string): Promise<Item[]> {
    try {
      const result = await sql`
        SELECT id, name, category, stock, location, condition, description, image_data, created_at, updated_at
        FROM items
        WHERE name ILIKE ${`%${query}%`} 
           OR category ILIKE ${`%${query}%`}
           OR location ILIKE ${`%${query}%`}
           OR description ILIKE ${`%${query}%`}
        ORDER BY created_at DESC
      `;
      return result.rows.map(transformItemRow);
    } catch (error) {
      console.error('Error searching items:', error);
      throw new Error('Failed to search items');
    }
  },

  async getItemsByCategory(category: string): Promise<Item[]> {
    try {
      const result = await sql`
        SELECT id, name, category, stock, location, condition, description, image_data, created_at, updated_at
        FROM items
        WHERE category = ${category}
        ORDER BY name
      `;
      return result.rows.map(transformItemRow);
    } catch (error) {
      console.error('Error getting items by category:', error);
      throw new Error('Failed to fetch items by category');
    }
  }
};

// User Services
export const userService = {
  async getAllUsers(): Promise<User[]> {
    try {
      const result = await sql`
        SELECT id, email, name, role, created_at, updated_at
        FROM users
        ORDER BY created_at DESC
      `;
      return result.rows.map(transformUserRow);
    } catch (error) {
      console.error('Error getting all users:', error);
      throw new Error('Failed to fetch users');
    }
  },

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const result = await sql`
        SELECT id, email, name, role, created_at, updated_at
        FROM users
        WHERE email = ${email}
      `;
    
      if (result.rows.length === 0) return null;
      return transformUserRow(result.rows[0]);
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw new Error('Failed to fetch user');
    }
  },

  async createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User | null> {
    try {
      const result = await sql`
        INSERT INTO users (email, name, role)
        VALUES (${user.email}, ${user.name}, ${user.role})
        RETURNING id, email, name, role, created_at, updated_at
      `;
      return result.rows[0] ? transformUserRow(result.rows[0]) : null;
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }
};

// Borrow Services - PERBAIKI BAGIAN INI
export const borrowService = {
  async getAllBorrowRecords(): Promise<BorrowRecord[]> {
    try {
      const result = await sql`
        SELECT br.*, i.name as item_name
        FROM borrow_records br
        LEFT JOIN items i ON br.item_id = i.id
        ORDER BY br.created_at DESC
      `;
      return result.rows.map(transformBorrowRow);
    } catch (error) {
      console.error('Error getting all borrow records:', error);
      throw new Error('Failed to fetch borrow records');
    }
  },

  async createBorrowRecord(record: Omit<BorrowRecord, 'id' | 'created_at' | 'updated_at' | 'item_name'>): Promise<BorrowRecord | null> {
    try {
      // Dapatkan nama item
      const itemResult = await sql`SELECT name FROM items WHERE id = ${record.item_id}`;
      const itemName = itemResult.rows[0]?.name || 'Unknown Item';

      // Format dates untuk database - PERBAIKAN DI SINI
      const borrowDate = formatDateForDB(record.borrow_date) || new Date().toISOString();
      const returnDate = formatDateForDB(record.return_date);
      const actualReturnDate = formatDateForDB(record.actual_return_date);

      const result = await sql`
        INSERT INTO borrow_records (
          item_id, item_name, borrower_name, quantity, borrow_date, 
          return_date, status, notes, created_by
        )
        VALUES (
          ${record.item_id}, 
          ${itemName}, 
          ${record.borrower_name}, 
          ${record.quantity}, 
          ${borrowDate},  // Sekarang sudah string
          ${returnDate},  // Sekarang sudah string
          ${record.status}, 
          ${record.notes}, 
          ${record.created_by}
        )
        RETURNING id
      `;
    
      if (result.rows[0]) {
        return this.getBorrowRecordById(result.rows[0].id);
      }
      return null;
    } catch (error) {
      console.error('Error creating borrow record:', error);
      throw new Error('Failed to create borrow record');
    }
  },

  async getBorrowRecordById(id: string): Promise<BorrowRecord | null> {
    try {
      const result = await sql`
        SELECT br.*, i.name as item_name
        FROM borrow_records br
        LEFT JOIN items i ON br.item_id = i.id
        WHERE br.id = ${id}
      `;
    
      if (result.rows.length === 0) return null;
      return transformBorrowRow(result.rows[0]);
    } catch (error) {
      console.error('Error getting borrow record by id:', error);
      throw new Error('Failed to fetch borrow record');
    }
  },

  async updateBorrowRecord(id: string, record: Partial<Omit<BorrowRecord, 'id' | 'created_at' | 'updated_at' | 'item_name'>>): Promise<BorrowRecord | null> {
    try {
      // Format dates untuk database - PERBAIKAN DI SINI
      const actualReturnDate = record.actual_return_date 
        ? formatDateForDB(record.actual_return_date) 
        : undefined;

      const result = await sql`
        UPDATE borrow_records
        SET
          status = COALESCE(${record.status}, status),
          actual_return_date = ${actualReturnDate},
          notes = COALESCE(${record.notes}, notes),
          verified_by = COALESCE(${record.verified_by}, verified_by),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING id
      `;
    
      if (result.rows.length === 0) return null;
      return this.getBorrowRecordById(id);
    } catch (error) {
      console.error('Error updating borrow record:', error);
      throw new Error('Failed to update borrow record');
    }
  },

  async getBorrowRecordsByStatus(status: string): Promise<BorrowRecord[]> {
    try {
      const result = await sql`
        SELECT br.*, i.name as item_name
        FROM borrow_records br
        LEFT JOIN items i ON br.item_id = i.id
        WHERE br.status = ${status}
        ORDER BY br.created_at DESC
      `;
      return result.rows.map(transformBorrowRow);
    } catch (error) {
      console.error('Error getting borrow records by status:', error);
      throw new Error('Failed to fetch borrow records');
    }
  }
};

// Dashboard Services
export const dashboardService = {
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const itemsResult = await sql`SELECT COUNT(*) as count FROM items`;
      const borrowedResult = await sql`SELECT COUNT(*) as count FROM borrow_records WHERE status = 'dipinjam'`;
      const damagedResult = await sql`SELECT COUNT(*) as count FROM items WHERE condition = 'rusak'`;
      const usersResult = await sql`SELECT COUNT(*) as count FROM users`;

      return {
        totalItems: parseInt(itemsResult.rows[0].count),
        totalBorrowed: parseInt(borrowedResult.rows[0].count),
        damagedItems: parseInt(damagedResult.rows[0].count),
        totalUsers: parseInt(usersResult.rows[0].count)
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw new Error('Failed to fetch dashboard stats');
    }
  },

  async getRecentActivities(): Promise<any[]> {
    try {
      const borrowsResult = await sql`
        SELECT br.*, i.name as item_name
        FROM borrow_records br
        LEFT JOIN items i ON br.item_id = i.id
        ORDER BY br.created_at DESC
        LIMIT 10
      `;

      return borrowsResult.rows.map(row => ({
        id: row.id,
        type: 'borrow',
        title: `Peminjaman ${row.item_name}`,
        description: `Dipinjam oleh ${row.borrower_name}`,
        date: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
        status: row.status
      }));
    } catch (error) {
      console.error('Error getting recent activities:', error);
      return [];
    }
  }
};

// Export untuk API routes
export default {
  itemService,
  userService,
  borrowService,
  dashboardService
};