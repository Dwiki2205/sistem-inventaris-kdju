// app/api/borrow/[id]/route.ts
import { NextResponse } from 'next/server';
import { borrowService } from '@/lib/database';

// Handler untuk GET /api/borrow/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('Fetching borrow record with ID:', id);
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }
    
    const record = await borrowService.getBorrowRecordById(id);
    
    if (!record) {
      return NextResponse.json(
        { error: 'Borrow record not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(record);
  } catch (error: any) {
    console.error('Error in GET /api/borrow/[id]:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to fetch borrow record',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// Handler untuk PUT /api/borrow/[id]
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('Updating borrow record with ID:', id);
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }
    
    const recordData = await request.json();
    console.log('Update data:', recordData);
    
    const updatedRecord = await borrowService.updateBorrowRecord(id, recordData);
    
    if (!updatedRecord) {
      return NextResponse.json(
        { error: 'Failed to update borrow record or record not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedRecord);
  } catch (error: any) {
    console.error('Error in PUT /api/borrow/[id]:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to update borrow record',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// Handler untuk DELETE /api/borrow/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('Deleting borrow record with ID:', id);
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID is required' },
        { status: 400 }
      );
    }
    
    const success = await borrowService.deleteBorrowRecord(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete borrow record or record not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, message: 'Borrow record deleted successfully' });
  } catch (error: any) {
    console.error('Error in DELETE /api/borrow/[id]:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to delete borrow record',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}