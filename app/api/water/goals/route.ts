import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectDB } from '@/lib/mongoose'
import { getWaterGoalModel } from '@/lib/models'

// GET: Fetch water goal
export async function GET(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    
    const WaterGoal = getWaterGoalModel()
    const waterGoalDoc = await WaterGoal.findOne({ userId: session.user.email })
    
    const waterGoal = waterGoalDoc?.targetMl || 2000 // Default 2000ml
    
    return NextResponse.json({ waterGoal })
  } catch (error) {
    console.error('Error fetching water goal:', error)
    return NextResponse.json({ error: 'Failed to fetch water goal' }, { status: 500 })
  }
}

// POST: Update water goal
export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { waterGoal } = await request.json()

    if (!waterGoal || waterGoal < 500 || waterGoal > 10000) {
      return NextResponse.json({ error: 'Invalid water goal. Must be between 500ml and 10000ml' }, { status: 400 })
    }

    await connectDB()
    
    const WaterGoal = getWaterGoalModel()
    
    const waterGoalDoc = await WaterGoal.findOneAndUpdate(
      { userId: session.user.email },
      { targetMl: waterGoal },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )
    
    return NextResponse.json({ waterGoal: waterGoalDoc?.targetMl || waterGoal })
  } catch (error) {
    console.error('Error updating water goal:', error)
    return NextResponse.json({ error: 'Failed to update water goal' }, { status: 500 })
  }
}
