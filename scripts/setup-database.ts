import { sql } from '@vercel/postgres';

async function main() {
  try {
    console.log('🔧 Setting up database tables...');
    
    await sql`SELECT 1 as test`;
    console.log('✅ Database connection successful');
    
    // Create tables
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
    console.log('✓ Users table created');

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
    console.log('✓ Items table created');

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
    console.log('✓ Borrow records table created');

    console.log('🎉 Database setup completed!');

  } catch (error: any) {
    console.error('❌ Error setting up database:', error.message);
  }
}

main();