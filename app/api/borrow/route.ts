// app/api/borrow/route.ts
import { NextResponse } from 'next/server';
import { borrowService } from '@/lib/database';
import { CreateBorrowRecordInput } from '@/types';

// Handler untuk GET /api/borrow - Get all borrow records
export async function GET() {
  try {
    console.log('Fetching all borrow records');
    const records = await borrowService.getAllBorrowRecords();
    return NextResponse.json(records);
  } catch (error: any) {
    console.error('Error in GET /api/borrow:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to fetch borrow records',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// Handler untuk POST /api/borrow - Create new borrow record
export async function POST(request: Request) {
  try {
    const recordData: CreateBorrowRecordInput = await request.json();
    console.log('Received borrow record data:', recordData);
    
    // Validasi data yang diperlukan
    if (!recordData.item_id || !recordData.borrower_name || !recordData.return_date) {
      return NextResponse.json(
        { 
          error: 'Missing required fields: item_id, borrower_name, and return_date are required',
          received: recordData
        },
        { status: 400 }
      );
    }
    
    // Validasi tanggal
    const borrowDate = recordData.borrow_date ? new Date(recordData.borrow_date) : new Date();
    const returnDate = new Date(recordData.return_date);
    
    if (returnDate <= borrowDate) {
      return NextResponse.json(
        { error: 'Return date must be after borrow date' },
        { status: 400 }
      );
    }
    
    // Validasi quantity
    if (recordData.quantity <= 0) {
      return NextResponse.json(
        { error: 'Quantity must be greater than 0' },
        { status: 400 }
      );
    }
    
    // Set default status jika tidak ada
    if (!recordData.status) {
      recordData.status = 'dipinjam';
    }
    
    console.log('Creating borrow record with validated data:', recordData);
    
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
      { 
        error: error.message || 'Failed to create borrow record',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}