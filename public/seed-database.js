import { sql } from '@vercel/postgres';

async function seedDatabase() {
  try {
    console.log('Seeding database with initial data...');
    
    // Insert sample users
    const usersResult = await sql`
      INSERT INTO users (email, name, role)
      VALUES
        ('admin@kdju.com', 'Admin KDJU', 'admin'),
        ('staff@kdju.com', 'Staff KDJU', 'staff')
      ON CONFLICT (email) DO NOTHING
      RETURNING id, email, name, role;
    `;
    console.log(`✓ ${usersResult.rowCount} users inserted`);

    // Insert sample items
    const itemsResult = await sql`
      INSERT INTO items (name, category, stock, location, condition, description)
      VALUES
        ('Proyektor Epson', 'Elektronik', 3, 'Ruang A', 'baik', 'Proyektor untuk presentasi dengan resolusi HD'),
        ('Kursi Lipat', 'Furniture', 50, 'Gudang B', 'baik', 'Kursi lipat untuk acara dengan kapasitas 50 buah'),
        ('Sound System', 'Elektronik', 2, 'Ruang Audio', 'perlu_perbaikan', 'Sound system portable dengan microphone'),
        ('Laptop Dell', 'Elektronik', 5, 'Ruang IT', 'baik', 'Laptop untuk presentasi dan administrasi'),
        ('Papan Tulis', 'Alat Tulis', 10, 'Gudang C', 'baik', 'Papan tulis putih ukuran 120x90cm')
      ON CONFLICT DO NOTHING
      RETURNING id, name;
    `;
    console.log(`✓ ${itemsResult.rowCount} items inserted`);

    console.log('🎉 Database seeded successfully!');
  
    // Show summary
    console.log('\n📊 Database Summary:');
    const usersCount = await sql`SELECT COUNT(*) FROM users`;
    const itemsCount = await sql`SELECT COUNT(*) FROM items`;
    console.log(` Users: ${usersCount.rows[0].count}`);
    console.log(` Items: ${itemsCount.rows[0].count}`);
  
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run seed if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}

export { seedDatabase };