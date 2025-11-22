import { sql } from '@vercel/postgres';

export async function connectDB() {
  try {
    await sql`SELECT 1`;
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
}

export { sql };