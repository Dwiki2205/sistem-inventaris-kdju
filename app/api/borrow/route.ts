// app/api/borrow/route.ts
import { NextResponse } from 'next/server';
import { borrowService } from '@/lib/database';

export async function GET() {
  try {
    const records = await borrowService.getAllBorrowRecords();
    return NextResponse.json(records);
  } catch (error: any) {
    console.error('Error in GET /api/borrow:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch borrow records' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const recordData = await request.json();
    console.log('Received borrow record data:', recordData);
    
    const newRecord = await borrowService.createBorrowRecord(recordData);
    
    if (!newRecord) {
      return NextResponse.json(
        { error: 'Failed to create borrow record' },
        { status: 500 }
      );
    }
    
    console.log('Successfully created borrow record:', newRecord);
    return NextResponse.json(newRecord, { status: 201 });
  } catch (error: any) {
    console.error('Error in POST /api/borrow:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create borrow record' },
      { status: 500 }
    );
  }
}