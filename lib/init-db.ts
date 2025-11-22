// src/lib/init-db.ts
import { sql } from '@vercel/postgres';

export async function initDatabase() {
  try {
    console.log('Inisialisasi tabel database...');

    // Users
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(20) CHECK (role IN ('admin', 'staff')) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Items
    await sql`
      CREATE TABLE IF NOT EXISTS items (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(255) NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0,
        location VARCHAR(255) NOT NULL,
        condition VARCHAR(20) CHECK (condition IN ('baik', 'rusak', 'perlu_perbaikan')) NOT NULL,
        description TEXT,
        image_data TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Borrow Records
    await sql`
      CREATE TABLE IF NOT EXISTS borrow_records (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        item_id UUID REFERENCES items(id) ON DELETE CASCADE,
        item_name VARCHAR(255) NOT NULL,
        borrower_name VARCHAR(255) NOT NULL,
        quantity INTEGER NOT NULL,
        borrow_date DATE NOT NULL,
        return_date DATE NOT NULL,
        actual_return_date DATE,
        notes TEXT,
        status VARCHAR(20) CHECK (status IN ('dipinjam', 'dikembalikan', 'terlambat', 'dibatalkan')) NOT NULL,
        created_by UUID REFERENCES users(id),
        verified_by UUID REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Seed data hanya jika belum ada
    const userCount = await sql`SELECT COUNT(*) FROM users`;
    if (parseInt(userCount.rows[0].count) === 0) {
      await sql`
        INSERT INTO users (email, name, role) VALUES
        ('admin@kdju.com', 'Admin KDJU', 'admin'),
        ('staff@kdju.com', 'Staff KDJU', 'staff')
        ON CONFLICT (email) DO NOTHING;
      `;

      await sql`
        INSERT INTO items (name, category, stock, location, condition, description) VALUES
        ('Proyektor Epson', 'Elektronik', 3, 'Ruang A', 'baik', 'Proyektor untuk presentasi dengan resolusi HD'),
        ('Kursi Lipat', 'Furniture', 50, 'Gudang B', 'baik', 'Kursi lipat untuk acara'),
        ('Sound System', 'Elektronik', 2, 'Ruang Audio', 'perlu_perbaikan', 'Sound system portable')
        ON CONFLICT DO NOTHING;
      `;

      console.log('Database berhasil diinisialisasi & seeded');
    } else {
      console.log('Database sudah ada, skip seeding');
    }
  } catch (error) {
    console.error('Gagal inisialisasi database:', error);
    throw error;
  }
}