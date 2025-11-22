import { NextResponse } from 'next/server';
import { itemService } from 'lib/database';

export async function GET() {
  try {
    const items = await itemService.getAllItems();
    return NextResponse.json(items);
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const itemData = await request.json();
    const newItem = await itemService.createItem(itemData);

    if (!newItem) {
      return NextResponse.json(
        { error: 'Failed to create item' },
        { status: 500 }
      );
    }

    return NextResponse.json(newItem, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to create item' },
      { status: 500 }
    );
  }
}