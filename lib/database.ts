// lib/database.ts
import { sql } from './db';
import { Item, BorrowRecord, User, DashboardStats, CreateBorrowRecordInput } from '../types';

// Helper untuk mengkonversi Date ke string format YYYY-MM-DD untuk PostgreSQL DATE
const formatDateForDB = (date: Date | string | null | undefined): string | null => {
  if (!date) return null;
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Validasi jika date valid
    if (isNaN(dateObj.getTime())) {
      console.error('Invalid date:', date);
      return null;
    }
    
    // Konversi ke format YYYY-MM-DD untuk kolom DATE di PostgreSQL
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Error formatting date:', error, 'Input date:', date);
    return null;
  }
};

// Helper untuk mengkonversi dari database ke ISO string
const formatDateFromDB = (date: string | Date | null): string => {
  if (!date) return new Date().toISOString();
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toISOString();
  } catch (error) {
    console.error('Error converting date from DB:', error);
    return new Date().toISOString();
  }
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
  created_at: formatDateFromDB(row.created_at),
  updated_at: formatDateFromDB(row.updated_at)
});

const transformBorrowRow = (row: any): BorrowRecord => ({
  id: row.id,
  item_id: row.item_id,
  item_name: row.item_name,
  borrower_name: row.borrower_name,
  quantity: row.quantity,
  borrow_date: formatDateFromDB(row.borrow_date),
  return_date: formatDateFromDB(row.return_date),
  actual_return_date: row.actual_return_date ? formatDateFromDB(row.actual_return_date) : undefined,
  status: row.status,
  notes: row.notes,
  created_by: row.created_by,
  verified_by: row.verified_by,
  created_at: formatDateFromDB(row.created_at),
  updated_at: formatDateFromDB(row.updated_at)
});

const transformUserRow = (row: any): User => ({
  id: row.id,
  email: row.email,
  name: row.name,
  role: row.role,
  created_at: formatDateFromDB(row.created_at),
  updated_at: formatDateFromDB(row.updated_at)
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
  },

  async updateItemStock(itemId: string, newStock: number): Promise<boolean> {
    try {
      const result = await sql`
        UPDATE items 
        SET stock = ${newStock}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${itemId}
        RETURNING id
      `;
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error updating item stock:', error);
      throw new Error('Failed to update item stock');
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

// Borrow Services - FIXED VERSION
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

  async createBorrowRecord(record: CreateBorrowRecordInput): Promise<BorrowRecord | null> {
    try {
      console.log('Creating borrow record with data:', record);
      
      // Validasi data input
      if (!record.item_id || !record.borrower_name || !record.borrow_date || !record.return_date) {
        throw new Error('Missing required fields');
      }

      if (record.quantity <= 0) {
        throw new Error('Quantity must be greater than 0');
      }

      // Dapatkan item dan validasi stok
      const itemResult = await sql`
        SELECT id, name, stock 
        FROM items 
        WHERE id = ${record.item_id}
        FOR UPDATE
      `;
      
      if (itemResult.rows.length === 0) {
        throw new Error('Item not found');
      }
      
      const itemName = itemResult.rows[0].name;
      const currentStock = itemResult.rows[0].stock;
      
      // Validasi stok
      if (currentStock < record.quantity) {
        throw new Error(`Insufficient stock. Available: ${currentStock}, Requested: ${record.quantity}`);
      }
      
      // Format dates untuk database
      const borrowDate = formatDateForDB(record.borrow_date);
      const returnDate = formatDateForDB(record.return_date);
      
      if (!borrowDate || !returnDate) {
        throw new Error('Invalid date format');
      }
      
      console.log('Formatted dates - borrow:', borrowDate, 'return:', returnDate);
      
      // Mulai transaction
      await sql`BEGIN`;
      
      try {
        // Kurangi stok item
        const newStock = currentStock - record.quantity;
        await sql`
          UPDATE items 
          SET stock = ${newStock}, updated_at = CURRENT_TIMESTAMP
          WHERE id = ${record.item_id}
        `;
        
        // Buat record peminjaman
        const result = await sql`
          INSERT INTO borrow_records (
            item_id, 
            item_name, 
            borrower_name, 
            quantity, 
            borrow_date, 
            return_date, 
            status, 
            notes, 
            created_by
          )
          VALUES (
            ${record.item_id}, 
            ${itemName}, 
            ${record.borrower_name}, 
            ${record.quantity}, 
            ${borrowDate}, 
            ${returnDate}, 
            ${record.status || 'dipinjam'}, 
            ${record.notes || ''}, 
            ${record.created_by}
          )
          RETURNING id, item_id, item_name, borrower_name, quantity, 
                    borrow_date, return_date, status, notes, created_by,
                    created_at, updated_at
        `;
        
        await sql`COMMIT`;
        
        if (!result.rows[0]) {
          throw new Error('Failed to create borrow record');
        }
        
        const newRecord = transformBorrowRow(result.rows[0]);
        console.log('Successfully created borrow record:', newRecord);
        
        return newRecord;
      } catch (error) {
        await sql`ROLLBACK`;
        throw error;
      }
    } catch (error) {
      console.error('Error creating borrow record:', error);
      throw new Error(error instanceof Error ? error.message : 'Failed to create borrow record');
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
      console.log('Updating borrow record:', id, record);
      
      // Format dates untuk database
      const actualReturnDate = record.actual_return_date 
        ? formatDateForDB(record.actual_return_date) 
        : undefined;

      // Jika status dikembalikan, update stok item
      if (record.status === 'dikembalikan' && record.actual_return_date) {
        // Dapatkan record untuk mengetahui item_id dan quantity
        const currentRecord = await this.getBorrowRecordById(id);
        if (currentRecord) {
          // Update stok item (tambah kembali)
          const item = await itemService.getItemById(currentRecord.item_id);
          if (item) {
            const newStock = item.stock + currentRecord.quantity;
            await itemService.updateItemStock(currentRecord.item_id, newStock);
          }
        }
      }

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
  },

  async getBorrowRecordsByItemId(itemId: string): Promise<BorrowRecord[]> {
    try {
      const result = await sql`
        SELECT br.*, i.name as item_name
        FROM borrow_records br
        LEFT JOIN items i ON br.item_id = i.id
        WHERE br.item_id = ${itemId}
        ORDER BY br.created_at DESC
      `;
      return result.rows.map(transformBorrowRow);
    } catch (error) {
      console.error('Error getting borrow records by item id:', error);
      throw new Error('Failed to fetch borrow records');
    }
  },

  async deleteBorrowRecord(id: string): Promise<boolean> {
    try {
      const result = await sql`
        DELETE FROM borrow_records
        WHERE id = ${id}
        RETURNING id
      `;
      return result.rows.length > 0;
    } catch (error) {
      console.error('Error deleting borrow record:', error);
      throw new Error('Failed to delete borrow record');
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