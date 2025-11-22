import { sql } from '@vercel/postgres';
import { Item, BorrowRecord, User, DashboardStats } from 'types';

// Improved error handling
const handleDatabaseError = (error: any, operation: string) => {
  console.error(`❌ Database Error ${operation}:`, {
    message: error.message,
    code: error.code,
    name: error.name
  });
  
  // More specific error messages for common issues
  if (error.message?.includes('connect') || error.message?.includes('timeout')) {
    throw new Error(`Tidak dapat terhubung ke database. Periksa koneksi internet dan konfigurasi database.`);
  }
  
  if (error.message?.includes('authentication')) {
    throw new Error(`Autentikasi database gagal. Periksa username dan password.`);
  }
  
  if (error.message?.includes('does not exist')) {
    throw new Error(`Tabel tidak ditemukan. Pastikan database sudah diinisialisasi dengan benar.`);
  }
  
  throw new Error(`Error database: Gagal ${operation} - ${error.message}`);
};

// Test connection on startup
export const testConnection = async () => {
  try {
    console.log('🔄 Testing database connection on startup...');
    const result = await sql`SELECT version() as version`;
    console.log('✅ Database connected successfully!');
    console.log('📊 PostgreSQL version:', result.rows[0]?.version);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed on startup:', error);
    return false;
  }
};

// Helper functions remain the same...
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

// Image compression helper (client-side only)
const compressImage = async (base64String: string): Promise<string> => {
  // Skip compression in server-side environment
  if (typeof window === 'undefined') {
    return base64String;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64String;
  
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
    
      if (!ctx) {
        resolve(base64String);
        return;
      }

      // Set maximum dimensions
      const MAX_WIDTH = 800;
      const MAX_HEIGHT = 600;
    
      let { width, height } = img;
    
      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width;
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height;
          height = MAX_HEIGHT;
        }
      }
    
      canvas.width = width;
      canvas.height = height;
    
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', 0.7));
    };
  
    img.onerror = () => resolve(base64String);
  });
};

// Item Services
export const itemService = {
  async getAllItems(): Promise<Item[]> {
    try {
      console.log('Fetching all items from database...');
      const result = await sql`
        SELECT id, name, category, stock, location, condition, description, image_data, created_at, updated_at
        FROM items
        ORDER BY created_at DESC
      `;
      console.log(`Found ${result.rows.length} items`);
      return result.rows.map(transformItemRow);
    } catch (error) {
      return handleDatabaseError(error, 'getting all items');
    }
  },

  async getItemById(id: string): Promise<Item | null> {
    try {
      console.log(`Fetching item with ID: ${id}`);
      const result = await sql`
        SELECT id, name, category, stock, location, condition, description, image_data, created_at, updated_at
        FROM items
        WHERE id = ${id}
      `;
    
      if (result.rows.length === 0) {
        console.log(`Item with ID ${id} not found`);
        return null;
      }
    
      console.log(`Item found: ${result.rows[0].name}`);
      return transformItemRow(result.rows[0]);
    } catch (error) {
      return handleDatabaseError(error, `getting item by id: ${id}`);
    }
  },

  async createItem(item: Omit<Item, 'id' | 'created_at' | 'updated_at'>): Promise<Item | null> {
    try {
      console.log('Creating new item:', {
        name: item.name,
        category: item.category,
        stock: item.stock,
        hasImage: !!item.image_data
      });

      // Optimize image data - compress jika terlalu besar
      let optimizedImageData = item.image_data;
      if (item.image_data && item.image_data.length > 500000) {
        console.log('Compressing image data...');
        optimizedImageData = await compressImage(item.image_data);
      }

      const result = await sql`
        INSERT INTO items (name, category, stock, location, condition, description, image_data)
        VALUES (${item.name}, ${item.category}, ${item.stock}, ${item.location}, ${item.condition}, ${item.description}, ${optimizedImageData})
        RETURNING id, name, category, stock, location, condition, description, image_data, created_at, updated_at
      `;
    
      console.log('Item created successfully with ID:', result.rows[0]?.id);
      return result.rows[0] ? transformItemRow(result.rows[0]) : null;
    } catch (error) {
      return handleDatabaseError(error, 'creating item');
    }
  },

  async updateItem(id: string, item: Partial<Omit<Item, 'id' | 'created_at' | 'updated_at'>>): Promise<Item | null> {
    try {
      console.log(`Updating item ${id}:`, {
        name: item.name,
        stock: item.stock,
        hasImage: !!item.image_data
      });

      let optimizedImageData = item.image_data;
      if (item.image_data && item.image_data.length > 500000) {
        console.log('Compressing image data for update...');
        optimizedImageData = await compressImage(item.image_data);
      }

      const result = await sql`
        UPDATE items
        SET
          name = COALESCE(${item.name}, name),
          category = COALESCE(${item.category}, category),
          stock = COALESCE(${item.stock}, stock),
          location = COALESCE(${item.location}, location),
          condition = COALESCE(${item.condition}, condition),
          description = COALESCE(${item.description}, description),
          image_data = COALESCE(${optimizedImageData}, image_data),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING id, name, category, stock, location, condition, description, image_data, created_at, updated_at
      `;
    
      if (result.rows.length === 0) {
        console.log(`Item with ID ${id} not found for update`);
        return null;
      }
    
      console.log('Item updated successfully');
      return result.rows[0] ? transformItemRow(result.rows[0]) : null;
    } catch (error) {
      return handleDatabaseError(error, `updating item: ${id}`);
    }
  },

  async deleteItem(id: string): Promise<boolean> {
    try {
      console.log(`Deleting item with ID: ${id}`);
      const result = await sql`
        DELETE FROM items
        WHERE id = ${id}
        RETURNING id
      `;
    
      const deleted = result.rows.length > 0;
      console.log(`Item ${id} deleted: ${deleted}`);
      return deleted;
    } catch (error) {
      return handleDatabaseError(error, `deleting item: ${id}`);
    }
  },

  async updateItemStock(id: string, newStock: number): Promise<boolean> {
    try {
      console.log(`Updating stock for item ${id} to ${newStock}`);
      const result = await sql`
        UPDATE items
        SET stock = ${newStock}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING id
      `;
    
      const updated = result.rows.length > 0;
      console.log(`Item ${id} stock updated: ${updated}`);
      return updated;
    } catch (error) {
      return handleDatabaseError(error, `updating item stock: ${id}`);
    }
  }
};

// Borrow Services
export const borrowService = {
  async getAllBorrowRecords(): Promise<BorrowRecord[]> {
    try {
      console.log('Fetching all borrow records from database...');
      const result = await sql`
        SELECT br.*, i.name as item_name
        FROM borrow_records br
        LEFT JOIN items i ON br.item_id = i.id
        ORDER BY br.created_at DESC
      `;
      console.log(`Found ${result.rows.length} borrow records`);
      return result.rows.map(transformBorrowRow);
    } catch (error) {
      return handleDatabaseError(error, 'getting all borrow records');
    }
  },

  async getBorrowRecordById(id: string): Promise<BorrowRecord | null> {
    try {
      console.log(`Fetching borrow record with ID: ${id}`);
      const result = await sql`
        SELECT br.*, i.name as item_name
        FROM borrow_records br
        LEFT JOIN items i ON br.item_id = i.id
        WHERE br.id = ${id}
      `;
    
      if (result.rows.length === 0) {
        console.log(`Borrow record with ID ${id} not found`);
        return null;
      }
    
      return transformBorrowRow(result.rows[0]);
    } catch (error) {
      return handleDatabaseError(error, `getting borrow record by id: ${id}`);
    }
  },

  async createBorrowRecord(record: Omit<BorrowRecord, 'id' | 'created_at' | 'updated_at' | 'item_name'> & { item_name?: string }): Promise<BorrowRecord | null> {
    try {
      console.log('Creating new borrow record:', {
        item_id: record.item_id,
        borrower_name: record.borrower_name
      });

      // Get item name if not provided
      let itemName = record.item_name;
      if (!itemName) {
        const itemResult = await sql`SELECT name FROM items WHERE id = ${record.item_id}`;
        if (itemResult.rows.length > 0) {
          itemName = itemResult.rows[0].name;
        } else {
          throw new Error(`Item with ID ${record.item_id} not found`);
        }
      }

      // Check item stock
      const itemResult = await sql`SELECT stock FROM items WHERE id = ${record.item_id}`;
      if (itemResult.rows.length === 0) {
        throw new Error(`Item with ID ${record.item_id} not found`);
      }

      const currentStock = itemResult.rows[0].stock;
      if (record.quantity > currentStock) {
        throw new Error(`Stok tidak mencukupi. Stok tersedia: ${currentStock}`);
      }

      // Update item stock
      await sql`UPDATE items SET stock = stock - ${record.quantity} WHERE id = ${record.item_id}`;

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
          ${record.borrow_date},
          ${record.return_date},
          ${record.status},
          ${record.notes},
          ${record.created_by}
        )
        RETURNING id
      `;
    
      console.log('Borrow record created successfully with ID:', result.rows[0]?.id);
    
      // Get the complete record with item name
      if (result.rows[0]) {
        return this.getBorrowRecordById(result.rows[0].id);
      }
    
      return null;
    } catch (error) {
      return handleDatabaseError(error, 'creating borrow record');
    }
  },

  async updateBorrowRecord(id: string, record: Partial<Omit<BorrowRecord, 'id' | 'created_at' | 'updated_at' | 'item_name'>>): Promise<BorrowRecord | null> {
    try {
      console.log(`Updating borrow record ${id}:`, {
        status: record.status,
        return_date: record.return_date
      });

      // If returning item, update stock
      if (record.status === 'dikembalikan' && record.actual_return_date) {
        const borrowRecord = await this.getBorrowRecordById(id);
        if (borrowRecord) {
          await sql`
            UPDATE items 
            SET stock = stock + ${borrowRecord.quantity} 
            WHERE id = ${borrowRecord.item_id}
          `;
        }
      }

      const result = await sql`
        UPDATE borrow_records
        SET
          item_id = COALESCE(${record.item_id}, item_id),
          borrower_name = COALESCE(${record.borrower_name}, borrower_name),
          quantity = COALESCE(${record.quantity}, quantity),
          borrow_date = COALESCE(${record.borrow_date}, borrow_date),
          return_date = COALESCE(${record.return_date}, return_date),
          actual_return_date = COALESCE(${record.actual_return_date}, actual_return_date),
          status = COALESCE(${record.status}, status),
          notes = COALESCE(${record.notes}, notes),
          verified_by = COALESCE(${record.verified_by}, verified_by),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING id
      `;
    
      if (result.rows.length === 0) {
        console.log(`Borrow record with ID ${id} not found for update`);
        return null;
      }
    
      console.log('Borrow record updated successfully');
      return this.getBorrowRecordById(id);
    } catch (error) {
      return handleDatabaseError(error, `updating borrow record: ${id}`);
    }
  },

  async deleteBorrowRecord(id: string): Promise<boolean> {
    try {
      console.log(`Deleting borrow record with ID: ${id}`);
      
      // Get record before deleting to restore stock
      const record = await this.getBorrowRecordById(id);
      if (record && record.status === 'dipinjam') {
        await sql`
          UPDATE items 
          SET stock = stock + ${record.quantity} 
          WHERE id = ${record.item_id}
        `;
      }

      const result = await sql`
        DELETE FROM borrow_records
        WHERE id = ${id}
        RETURNING id
      `;
    
      const deleted = result.rows.length > 0;
      console.log(`Borrow record ${id} deleted: ${deleted}`);
      return deleted;
    } catch (error) {
      return handleDatabaseError(error, `deleting borrow record: ${id}`);
    }
  },

  async getBorrowRecordsByItemId(itemId: string): Promise<BorrowRecord[]> {
    try {
      console.log(`Fetching borrow records for item: ${itemId}`);
      const result = await sql`
        SELECT br.*, i.name as item_name
        FROM borrow_records br
        LEFT JOIN items i ON br.item_id = i.id
        WHERE br.item_id = ${itemId}
        ORDER BY br.created_at DESC
      `;
      return result.rows.map(transformBorrowRow);
    } catch (error) {
      return handleDatabaseError(error, `getting borrow records by item id: ${itemId}`);
    }
  }
};

// User Services
export const userService = {
  async getAllUsers(): Promise<User[]> {
    try {
      console.log('Fetching all users from database...');
      const result = await sql`
        SELECT id, email, name, role, created_at, updated_at
        FROM users
        ORDER BY created_at DESC
      `;
      console.log(`Found ${result.rows.length} users`);
      return result.rows.map(transformUserRow);
    } catch (error) {
      return handleDatabaseError(error, 'getting all users');
    }
  },

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      console.log(`Fetching user with email: ${email}`);
      const result = await sql`
        SELECT id, email, name, role, created_at, updated_at
        FROM users
        WHERE email = ${email}
      `;
    
      if (result.rows.length === 0) {
        console.log(`User with email ${email} not found`);
        return null;
      }
    
      console.log(`User found: ${result.rows[0].name}`);
      return transformUserRow(result.rows[0]);
    } catch (error) {
      return handleDatabaseError(error, `getting user by email: ${email}`);
    }
  },

  async getUserById(id: string): Promise<User | null> {
    try {
      console.log(`Fetching user with ID: ${id}`);
      const result = await sql`
        SELECT id, email, name, role, created_at, updated_at
        FROM users
        WHERE id = ${id}
      `;
    
      if (result.rows.length === 0) {
        console.log(`User with ID ${id} not found`);
        return null;
      }
    
      return transformUserRow(result.rows[0]);
    } catch (error) {
      return handleDatabaseError(error, `getting user by id: ${id}`);
    }
  },

  async createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User | null> {
    try {
      console.log('Creating new user:', {
        email: user.email,
        name: user.name,
        role: user.role
      });

      const result = await sql`
        INSERT INTO users (email, name, role)
        VALUES (${user.email}, ${user.name}, ${user.role})
        RETURNING id, email, name, role, created_at, updated_at
      `;
    
      console.log('User created successfully with ID:', result.rows[0]?.id);
      return result.rows[0] ? transformUserRow(result.rows[0]) : null;
    } catch (error) {
      return handleDatabaseError(error, 'creating user');
    }
  },

  async updateUser(id: string, user: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>): Promise<User | null> {
    try {
      console.log(`Updating user ${id}:`, {
        name: user.name,
        role: user.role
      });

      const result = await sql`
        UPDATE users
        SET
          email = COALESCE(${user.email}, email),
          name = COALESCE(${user.name}, name),
          role = COALESCE(${user.role}, role),
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${id}
        RETURNING id, email, name, role, created_at, updated_at
      `;
    
      if (result.rows.length === 0) {
        console.log(`User with ID ${id} not found for update`);
        return null;
      }
    
      console.log('User updated successfully');
      return result.rows[0] ? transformUserRow(result.rows[0]) : null;
    } catch (error) {
      return handleDatabaseError(error, `updating user: ${id}`);
    }
  },

  async deleteUser(id: string): Promise<boolean> {
    try {
      console.log(`Deleting user with ID: ${id}`);
      const result = await sql`
        DELETE FROM users
        WHERE id = ${id}
        RETURNING id
      `;
    
      const deleted = result.rows.length > 0;
      console.log(`User ${id} deleted: ${deleted}`);
      return deleted;
    } catch (error) {
      return handleDatabaseError(error, `deleting user: ${id}`);
    }
  }
};

// Dashboard Services
export const dashboardService = {
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      console.log('Fetching dashboard stats...');
    
      // Get total items
      const itemsResult = await sql`SELECT COUNT(*) as count FROM items`;
      const totalItems = parseInt(itemsResult.rows[0].count);
    
      // Get total borrowed items (records with status 'dipinjam')
      const borrowedResult = await sql`SELECT COUNT(*) as count FROM borrow_records WHERE status = 'dipinjam'`;
      const totalBorrowed = parseInt(borrowedResult.rows[0].count);
    
      // Get damaged items
      const damagedResult = await sql`SELECT COUNT(*) as count FROM items WHERE condition = 'rusak'`;
      const damagedItems = parseInt(damagedResult.rows[0].count);
    
      // Get total users
      const usersResult = await sql`SELECT COUNT(*) as count FROM users`;
      const totalUsers = parseInt(usersResult.rows[0].count);
    
      const stats = {
        totalItems,
        totalBorrowed,
        damagedItems,
        totalUsers
      };
    
      console.log('Dashboard stats:', stats);
      return stats;
    } catch (error) {
      return handleDatabaseError(error, 'getting dashboard stats');
    }
  },

  async getRecentBorrowRecords(limit: number = 5): Promise<BorrowRecord[]> {
    try {
      console.log(`Fetching ${limit} recent borrow records...`);
      const result = await sql`
        SELECT br.*, i.name as item_name
        FROM borrow_records br
        LEFT JOIN items i ON br.item_id = i.id
        ORDER BY br.created_at DESC
        LIMIT ${limit}
      `;
      return result.rows.map(transformBorrowRow);
    } catch (error) {
      return handleDatabaseError(error, 'getting recent borrow records');
    }
  }
};