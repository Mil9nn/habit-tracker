import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import { WaterEntry } from '@/lib/models/WaterEntry';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const { amount, unit } = body;
    
    if (!amount || isNaN(parseFloat(amount))) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    await connectDB();
    
    const updatedEntry = await WaterEntry.findOneAndUpdate(
      { 
        _id: id,
        userId: session.user.email 
      },
      { 
        amount: parseFloat(amount),
        unit: unit || 'ml'
      },
      { new: true }
    );

    if (!updatedEntry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }
    
    return NextResponse.json({ entry: updatedEntry });
  } catch (error) {
    console.error('Error updating water entry:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      error: 'Failed to update water entry',
      details: errorMessage 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    await connectDB();
    
    const result = await WaterEntry.deleteOne({
      _id: id,
      userId: session.user.email
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting water entry:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      error: 'Failed to delete water entry',
      details: errorMessage 
    }, { status: 500 });
  }
}
