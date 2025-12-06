import { NextResponse, NextRequest } from 'next/server';
import { borrowService } from '@/lib/database'; // Perbaiki path

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const recordData = await request.json();
    
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