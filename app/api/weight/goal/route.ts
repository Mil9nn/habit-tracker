import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { connectDB } from '@/lib/mongoose'
import WeightGoal from '@/lib/models/WeightGoal'

// GET - Fetch weight goal
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    
    const goal = await WeightGoal.findOne({ 
      userEmail: session.user.email 
    }).sort({ createdAt: -1 })

    return NextResponse.json({ goal })
  } catch (error) {
    console.error('Error fetching weight goal:', error)
    return NextResponse.json({ error: 'Failed to fetch goal' }, { status: 500 })
  }
}

// POST - Create/update weight goal
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { targetWeight, unit } = body

    if (!targetWeight || !unit) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await connectDB()

    // Check if goal exists and update, otherwise create new
    const existingGoal = await WeightGoal.findOne({
      userEmail: session.user.email
    })

    let goal
    if (existingGoal) {
      goal = await WeightGoal.findOneAndUpdate(
        { userEmail: session.user.email },
        { 
          targetWeight, 
          unit, 
          startDate: new Date().toISOString().split('T')[0],
          updatedAt: new Date()
        },
        { new: true }
      )
    } else {
      goal = await WeightGoal.create({
        userEmail: session.user.email,
        targetWeight,
        unit,
        startDate: new Date().toISOString().split('T')[0]
      })
    }

    return NextResponse.json({ goal })
  } catch (error) {
    console.error('Error saving weight goal:', error)
    return NextResponse.json({ error: 'Failed to save goal' }, { status: 500 })
  }
}

// DELETE - Delete weight goal
export async function DELETE() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const result = await WeightGoal.deleteOne({
      userEmail: session.user.email
    })

    return NextResponse.json({ success: result.deletedCount > 0 })
  } catch (error) {
    console.error('Error deleting weight goal:', error)
    return NextResponse.json({ error: 'Failed to delete goal' }, { status: 500 })
  }
}
