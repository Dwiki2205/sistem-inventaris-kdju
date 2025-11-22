import { sql } from './db';
import { Item, BorrowRecord, User, DashboardStats } from 'types';

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
  created_at: row.created_at,
  updated_at: row.updated_at
});

const transformBorrowRow = (row: any): BorrowRecord => ({
  id: row.id,
  item_id: row.item_id,
  item_name: row.item_name,
  borrower_name: row.borrower_name,
  quantity: row.quantity,
  borrow_date: row.borrow_date,
  return_date: row.return_date,
  actual_return_date: row.actual_return_date,
  status: row.status,
  notes: row.notes,
  created_by: row.created_by,
  verified_by: row.verified_by,
  created_at: row.created_at,
  updated_at: row.updated_at
});

const transformUserRow = (row: any): User => ({
  id: row.id,
  email: row.email,
  name: row.name,
  role: row.role,
  created_at: row.created_at,
  updated_at: row.updated_at
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
      throw error;
    }
  },

  async getItemById(id: string): Promise<Item | null> {
    try {
      const result = await sql`
        SELECT id, name, category, stock, location, condition, description, image_data, created_at, updated_at
        FROM items
        WHERE id = ${id}
      `;
    
      if (result.rows.length === 0) return null;
      return transformItemRow(result.rows[0]);
    } catch (error) {
      console.error('Error getting item by id:', error);
      throw error;
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
      throw error;
    }
  },

  async updateItem(id: string, item: Partial<Omit<Item, 'id' | 'created_at' | 'updated_at'>>): Promise<Item | null> {
    try {
      const result = await sql`
        UPDATE items
        SET
          name = COALESCE(${item.name}, name),
          category = COALESCE(${item.category}, category),
          stock = COALESCE(${item.stock}, stock),
          location = COALESCE(${item.location}, location),
          condition = COALESCE(${item.condition}, condition),
          description = COALESCE(${item.description}, description),
          image_data = COALESCE(${item.image_data}, image_data),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING id, name, category, stock, location, condition, description, image_data, created_at, updated_at
      `;
    
      if (result.rows.length === 0) return null;
      return result.rows[0] ? transformItemRow(result.rows[0]) : null;
    } catch (error) {
      console.error('Error updating item:', error);
      throw error;
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
      throw error;
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
      throw error;
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
      throw error;
    }
  }
};

// Borrow Services
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
      throw error;
    }
  },

  async createBorrowRecord(record: Omit<BorrowRecord, 'id' | 'created_at' | 'updated_at' | 'item_name'> & { item_name?: string }): Promise<BorrowRecord | null> {
    try {
      let itemName = record.item_name;
      if (!itemName) {
        const itemResult = await sql`SELECT name FROM items WHERE id = ${record.item_id}`;
        if (itemResult.rows.length > 0) {
          itemName = itemResult.rows[0].name;
        }
      }

      const result = await sql`
        INSERT INTO borrow_records (
          item_id, item_name, borrower_name, quantity, borrow_date, return_date, status, notes, created_by
        )
        VALUES (
          ${record.item_id}, ${itemName}, ${record.borrower_name}, ${record.quantity}, 
          ${record.borrow_date}, ${record.return_date}, ${record.status}, ${record.notes}, ${record.created_by}
        )
        RETURNING id
      `;
    
      if (result.rows[0]) {
        return this.getBorrowRecordById(result.rows[0].id);
      }
      return null;
    } catch (error) {
      console.error('Error creating borrow record:', error);
      throw error;
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
      throw error;
    }
  },

  async updateBorrowRecord(id: string, record: Partial<Omit<BorrowRecord, 'id' | 'created_at' | 'updated_at' | 'item_name'>>): Promise<BorrowRecord | null> {
    try {
      const result = await sql`
        UPDATE borrow_records
        SET
          status = COALESCE(${record.status}, status),
          actual_return_date = COALESCE(${record.actual_return_date}, actual_return_date),
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
      throw error;
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
      throw error;
    }
  }
};