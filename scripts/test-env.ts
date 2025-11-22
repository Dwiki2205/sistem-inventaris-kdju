import { config } from 'dotenv';

// Load environment variables
config({ path: '.env.local' });

console.log('🔍 Testing environment variables...');
console.log('📁 Current directory:', process.cwd());
console.log('📊 DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Not set');
console.log('📊 POSTGRES_URL:', process.env.POSTGRES_URL ? '✅ Set' : '❌ Not set');

if (process.env.DATABASE_URL) {
  console.log('📋 DATABASE_URL length:', process.env.DATABASE_URL.length);
}