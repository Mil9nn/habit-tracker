// What this API does:
// - GET: Fetches water logs for the authenticated user for a specific date range
// - POST: Creates a new water log entry for the authenticated user

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectDB } from '@/lib/mongoose'
import { getWaterLogModel } from '@/lib/models'

export async function GET(req: Request) {
  const session = await getServerSession()
  if (!session?.user?.email)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')

  await connectDB()
  
  const WaterLog = getWaterLogModel()
  const query: any = { userId: session.user.email }
  
  if (startDate || endDate) {
    query.date = {}
    if (startDate) {
      const start = new Date(startDate)
      start.setHours(0, 0, 0, 0) // Start of day
      query.date.$gte = start
    }
    if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999) // End of day
      query.date.$lte = end
    }
  }

  const logs = await WaterLog.find(query).sort({ date: -1 })
  
  return NextResponse.json(logs)
}

export async function POST(req: Request) {
  const session = await getServerSession()
  if (!session?.user?.email)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { amountMl, date } = await req.json()

  if (!amountMl || amountMl <= 0) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
  }

  await connectDB()
  
  const WaterLog = getWaterLogModel()
  const log = await WaterLog.create({
    userId: session.user.email,
    amountMl,
    date: date ? new Date(date) : new Date(),
  })

  return NextResponse.json(log, { status: 201 })
}
