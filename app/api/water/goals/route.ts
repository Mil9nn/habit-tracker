
// What this API does:
// - GET: Fetches the water goal for the authenticated user (calculated based on profile)
// - POST: Creates or updates the water goal for the authenticated user

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectDB } from '@/lib/mongoose'
import { getWaterGoalModel, getUserProfileModel } from '@/lib/models'
import { calculateWaterIntake } from '@/lib/waterCalculator'

export async function GET() {
  const session = await getServerSession()
  if (!session?.user?.email)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  
  // Get user profile to calculate personalized goal
  const UserProfile = getUserProfileModel()
  const profile = await UserProfile.findOne({ userId: session.user.email })
  
  let calculatedGoal = 2000 // default fallback
  
  if (profile) {
    const factors = calculateWaterIntake(profile)
    calculatedGoal = factors.totalRecommended
  }
  
  // Check if user has a custom goal override
  const WaterGoal = getWaterGoalModel()
  const customGoal = await WaterGoal.findOne({ userId: session.user.email })

  return NextResponse.json({ 
    targetMl: customGoal?.targetMl || calculatedGoal,
    isCalculated: !customGoal, // whether this is calculated or manually set
    calculation: profile ? calculateWaterIntake(profile) : null
  })
}

export async function POST(req: Request) {
  const session = await getServerSession()
  if (!session?.user?.email)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { targetMl } = await req.json()

  await connectDB()
  const WaterGoal = getWaterGoalModel()
  const goal = await WaterGoal.findOneAndUpdate(
    { userId: session.user.email },
    { targetMl },
    { upsert: true, new: true }
  )

  return NextResponse.json(goal)
}
