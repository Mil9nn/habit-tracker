
// What this API does:
// - GET: Fetches the water goal for the authenticated user
// - POST: Creates or updates the water goal for the authenticated user

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectDB } from '@/lib/mongoose'
import { getWaterGoalModel } from '@/lib/models'

export async function GET() {
  const session = await getServerSession()
  if (!session?.user?.email)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  await connectDB()
  const WaterGoal = getWaterGoalModel()
  const goal = await WaterGoal.findOne({ userId: session.user.email })

  return NextResponse.json(goal ?? { targetMl: 2000 })
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
