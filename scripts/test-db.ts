import { config } from 'dotenv';
import { sql } from '@vercel/postgres';

// Load environment variables from .env.local
config({ path: '.env.local' });

async function main() {
  try {
    console.log('🔌 Testing database connection...');
    
    await sql`SELECT 1 as test`;
    console.log('✅ Database connection successful');
    
    const usersResult = await sql`SELECT * FROM users`;
    console.log(`📊 Users in database: ${usersResult.rows.length}`);
    
    usersResult.rows.forEach((user: any) => {
      console.log(`   - ${user.email}: ${user.name} (${user.role})`);
    });
    
    const adminResult = await sql`SELECT * FROM users WHERE email = 'admin@kdju.com'`;
    console.log(`👤 Admin user found: ${adminResult.rows.length > 0}`);
    
  } catch (error: any) {
    console.error('❌ Database test failed:', error.message);
  }
}

main();