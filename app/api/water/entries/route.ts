import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import { WaterEntry } from '@/lib/models/WaterEntry';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    
    let query: any = { userId: session.user.email };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    const entries = await WaterEntry
      .find(query)
      .sort({ date: -1 })
      .lean();
    
    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Error fetching water entries:', error);
    return NextResponse.json({ error: 'Failed to fetch water entries' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication first
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized - Please sign in' }, { status: 401 });
    }

    // Parse request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    const { amount, unit = 'ml' } = body;
    
    // Validate amount
    if (!amount || isNaN(parseFloat(amount))) {
      return NextResponse.json({ error: 'Invalid amount provided' }, { status: 400 });
    }

    // Connect to database
    try {
      await connectDB();
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }
    
    // Create entry
    try {
      const newEntry = await WaterEntry.create({
        userId: session.user.email,
        amount: parseFloat(amount),
        unit,
        date: new Date()
      });
      
      return NextResponse.json({ entry: newEntry }, { status: 201 });
    } catch (createError) {
      console.error('Failed to create water entry:', createError);
      const errorMessage = createError instanceof Error ? createError.message : 'Unknown error';
      return NextResponse.json({ 
        error: 'Failed to save water entry',
        details: errorMessage 
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Unexpected error in POST /api/water/entries:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ 
      error: 'Internal server error',
      details: errorMessage 
    }, { status: 500 });
  }
}
