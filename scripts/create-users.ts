import { config } from 'dotenv';
import { sql } from '@vercel/postgres';

// Load environment variables from .env.local
config({ path: '.env.local' });

async function main() {
  try {
    console.log('👥 Creating default users...');
    
    await sql`
      INSERT INTO users (email, name, role)
      VALUES ('admin@kdju.com', 'Admin KDJU', 'admin')
      ON CONFLICT (email) DO NOTHING
    `;
    
    await sql`
      INSERT INTO users (email, name, role)
      VALUES ('staff@kdju.com', 'Staff KDJU', 'staff')
      ON CONFLICT (email) DO NOTHING
    `;
    
    console.log('✅ Default users created');
    
    const usersResult = await sql`SELECT * FROM users`;
    console.log(`📊 Total users: ${usersResult.rows.length}`);
    
    usersResult.rows.forEach((user: any) => {
      console.log(`   - ${user.email}: ${user.name} (${user.role})`);
    });
    
  } catch (error: any) {
    console.error('❌ Error creating users:', error.message);
  }
}

main();