// What this API does:
// - GET: Fetches user profile for calorie tracking
// - POST: Creates or updates user profile for calorie tracking

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectDB } from '@/lib/mongoose'
import { getUserProfileModel, getMealLogModel } from '@/lib/models'
import { calculateDailyCalorieNeeds } from '@/lib/calorieCalculator'

export async function GET(req: Request) {
  const session = await getServerSession()
  if (!session?.user?.email)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  
  const UserProfile = getUserProfileModel()
  const profile = await UserProfile.findOne({ userId: session.user.email })
  
  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  // Calculate recommended daily calories based on profile
  const recommendedCalories = calculateDailyCalorieNeeds({
    age: profile.age,
    gender: profile.gender,
    weight: profile.weight,
    height: profile.height,
    activityLevel: profile.activityLevel
  })

  return NextResponse.json({
    profile: {
      ...profile.toObject(),
      name: session.user.name || 'User',
      email: session.user.email,
      image: session.user.image,
    },
    recommendedCalories
  })
}

export async function POST(req: Request) {
  const session = await getServerSession()
  if (!session?.user?.email)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { age, gender, weight, height, activityLevel, dailyCalorieGoal } = await req.json()

  // Validate input
  if (!age || !gender || !weight || !height || !activityLevel) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (age < 18 || age > 100 || weight < 30 || weight > 300 || height < 100 || height > 250) {
    return NextResponse.json({ error: 'Invalid input values' }, { status: 400 })
  }

  await connectDB()
  
  const UserProfile = getUserProfileModel()
  const profile = await UserProfile.findOneAndUpdate(
    { userId: session.user.email },
    {
      age,
      gender,
      weight,
      height,
      activityLevel,
      dailyCalorieGoal: dailyCalorieGoal || calculateDailyCalorieNeeds({ age, gender, weight, height, activityLevel }),
      userId: session.user.email,
      image: session.user.image
    },
    { new: true, upsert: true }
  )

  return NextResponse.json(profile)
}
