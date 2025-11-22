import { NextResponse } from 'next/server';
import { userService } from 'lib/database';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    const user = await userService.getUserByEmail(email);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    const isValidPassword = 
      (email === 'admin@kdju.com' && password === 'admin123') ||
      (email === 'staff@kdju.com' && password === 'staff123');

    if (isValidPassword) {
      return NextResponse.json({ user });
    }

    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}