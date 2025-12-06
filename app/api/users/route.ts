import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const users = await sql`SELECT * FROM users ORDER BY created_at DESC`;
    return NextResponse.json(users.rows);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { email, name, role } = await request.json();
    
    const user = await sql`
      INSERT INTO users (email, name, role) 
      VALUES (${email}, ${name}, ${role}) 
      RETURNING *
    `;
    
    return NextResponse.json(user.rows[0]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}