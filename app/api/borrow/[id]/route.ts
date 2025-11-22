import { NextResponse } from 'next/server';
import { borrowService } from 'config/database';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Tunggu params diselesaikan terlebih dahulu
    const { id } = await params;
    const recordData = await request.json();
    
    // Sekarang gunakan id yang sudah di-resolve
    const updatedRecord = await borrowService.updateBorrowRecord(id, recordData);
    
    if (!updatedRecord) {
      return NextResponse.json(
        { error: 'Failed to update borrow record' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(updatedRecord);
  } catch (error) {
    console.error('Error updating borrow record:', error);
    return NextResponse.json(
      { error: 'Failed to update borrow record' },
      { status: 500 }
    );
  }
}