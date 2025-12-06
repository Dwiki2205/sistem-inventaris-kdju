// app/api/items/[id]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { itemService } from '@/lib/database';

// Helper untuk menangani error
const handleError = (error: any, context: string) => {
  console.error(`Error in ${context}:`, error);
  
  if (error.message.includes('invalid input syntax')) {
    return NextResponse.json(
      { error: 'Invalid data format' },
      { status: 400 }
    );
  }
  
  if (error.message.includes('not found')) {
    return NextResponse.json(
      { error: 'Item not found' },
      { status: 404 }
    );
  }
  
  return NextResponse.json(
    { error: `Failed to ${context}: ${error.message}` },
    { status: 500 }
  );
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = params.id;
    
    console.log('API GET: Fetching item with ID:', id);
    
    if (!id || id === 'undefined' || id === 'null') {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    const item = await itemService.getItemById(id);
    
    if (!item) {
      return NextResponse.json(
        { error: `Item with ID ${id} not found` },
        { status: 404 }
      );
    }
    
    console.log('API GET: Successfully fetched item:', item.id);
    return NextResponse.json(item);
    
  } catch (error: any) {
    return handleError(error, 'fetch item');
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = params.id;
    
    console.log('API PUT: Updating item with ID:', id);
    
    if (!id || id === 'undefined' || id === 'null') {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    // Parse request body
    let itemData;
    try {
      itemData = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Invalid JSON data' },
        { status: 400 }
      );
    }
    
    console.log('API PUT: Update data received:', itemData);

    // Validasi data
    const errors: string[] = [];
    
    if (itemData.name !== undefined && !itemData.name.trim()) {
      errors.push('Name cannot be empty');
    }
    
    if (itemData.category !== undefined && !itemData.category.trim()) {
      errors.push('Category cannot be empty');
    }
    
    if (itemData.location !== undefined && !itemData.location.trim()) {
      errors.push('Location cannot be empty');
    }
    
    if (itemData.stock !== undefined && (isNaN(Number(itemData.stock)) || Number(itemData.stock) < 0)) {
      errors.push('Stock must be a non-negative number');
    }
    
    if (itemData.condition !== undefined && !['baik', 'rusak', 'perlu_perbaikan'].includes(itemData.condition)) {
      errors.push('Condition must be one of: baik, rusak, perlu_perbaikan');
    }
    
    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    
    if (itemData.name !== undefined) updateData.name = itemData.name.trim();
    if (itemData.category !== undefined) updateData.category = itemData.category.trim();
    if (itemData.location !== undefined) updateData.location = itemData.location.trim();
    if (itemData.stock !== undefined) updateData.stock = Number(itemData.stock);
    if (itemData.condition !== undefined) updateData.condition = itemData.condition;
    if (itemData.description !== undefined) updateData.description = itemData.description.trim();
    if (itemData.image_data !== undefined) updateData.image_data = itemData.image_data;

    // Update item
    const updatedItem = await itemService.updateItem(id, updateData);
    
    if (!updatedItem) {
      return NextResponse.json(
        { error: 'Item not found or failed to update' },
        { status: 404 }
      );
    }
    
    console.log('API PUT: Successfully updated item:', updatedItem.id);
    return NextResponse.json(updatedItem);
    
  } catch (error: any) {
    return handleError(error, 'update item');
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = params.id;
    
    console.log('API DELETE: Deleting item with ID:', id);
    
    if (!id || id === 'undefined' || id === 'null') {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    const success = await itemService.deleteItem(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Item not found or failed to delete' },
        { status: 404 }
      );
    }
    
    console.log('API DELETE: Successfully deleted item:', id);
    return NextResponse.json({ 
      success: true, 
      message: 'Item deleted successfully',
      id: id
    });
    
  } catch (error: any) {
    return handleError(error, 'delete item');
  }
}

// OPTIONS handler untuk CORS (jika diperlukan)
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}