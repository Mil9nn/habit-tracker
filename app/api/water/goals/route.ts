import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectDB } from '@/lib/mongoose'
import { getUserProfileModel } from '@/lib/models'

// GET: Fetch water goal
export async function GET(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    
    const UserProfile = getUserProfileModel()
    const userProfile = await UserProfile.findOne({ userId: session.user.email })
    
    const waterGoal = userProfile?.waterGoal || 2000 // Default 2000ml
    
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
    
    const UserProfile = getUserProfileModel()
    
    // Update or create user profile with water goal
    const userProfile = await UserProfile.findOneAndUpdate(
      { userId: session.user.email },
      { 
        $set: { waterGoal },
        $setOnInsert: { 
          userId: session.user.email,
          calorieGoal: 2000, // Default calorie goal
          proteinGoal: 50,   // Default protein goal
          carbsGoal: 250,    // Default carbs goal
          fatGoal: 65        // Default fat goal
        }
      },
      { upsert: true, new: true }
    )
    
    return NextResponse.json({ waterGoal })
  } catch (error) {
    console.error('Error updating water goal:', error)
    return NextResponse.json({ error: 'Failed to update water goal' }, { status: 500 })
  }
}
