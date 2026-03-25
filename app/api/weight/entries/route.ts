import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongoose'
import WeightLog from '@/lib/models/WeightLog'

// GET - Fetch weight entries
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    
    const entries = await WeightLog.find({ 
      userEmail: session.user.email 
    }).sort({ date: 1 })

    return NextResponse.json({ entries })
  } catch (error) {
    console.error('Error fetching weight entries:', error)
    return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 })
  }
}

// POST - Create/update weight entry
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { weight, unit, date } = body

    if (!weight || !unit || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await connectDB()

    // Check if entry exists for this date and update, otherwise create new
    const existingEntry = await WeightLog.findOne({
      userEmail: session.user.email,
      date: date
    })

    let entry
    if (existingEntry) {
      entry = await WeightLog.findOneAndUpdate(
        { userEmail: session.user.email, date: date },
        { weight, unit },
        { new: true }
      )
    } else {
      entry = await WeightLog.create({
        userEmail: session.user.email,
        weight,
        unit,
        date
      })
    }

    return NextResponse.json({ entry })
  } catch (error) {
    console.error('Error saving weight entry:', error)
    return NextResponse.json({ error: 'Failed to save entry' }, { status: 500 })
  }
}

// PUT - Update weight entry
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { weight, unit, date } = body

    if (!weight || !unit || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await connectDB()

    const entry = await WeightLog.findOneAndUpdate(
      { userEmail: session.user.email, date: date },
      { weight, unit },
      { new: true }
    )

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    return NextResponse.json({ entry })
  } catch (error) {
    console.error('Error updating weight entry:', error)
    return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 })
  }
}

// DELETE - Delete weight entry
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')

    if (!date) {
      return NextResponse.json({ error: 'Date parameter required' }, { status: 400 })
    }

    await connectDB()

    const result = await WeightLog.deleteOne({
      userEmail: session.user.email,
      date: date
    })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting weight entry:', error)
    return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 })
  }
}
