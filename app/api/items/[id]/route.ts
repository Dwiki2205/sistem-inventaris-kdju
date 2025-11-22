import { NextResponse } from 'next/server';
import { itemService } from 'lib/database';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const item = await itemService.getItemById(params.id);
    
    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(item);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch item' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const itemData = await request.json();
    const updatedItem = await itemService.updateItem(params.id, itemData);
    
    if (!updatedItem) {
      return NextResponse.json(
        { error: 'Failed to update item' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(updatedItem);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const success = await itemService.deleteItem(params.id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete item' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ message: 'Item deleted successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    );
  }
}