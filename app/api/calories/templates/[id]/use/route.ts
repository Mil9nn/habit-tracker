import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectDB } from '@/lib/mongoose'
import { MealTemplate } from '@/lib/models/MealTemplate'

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    await connectDB()
    
    const template = await MealTemplate.findOneAndUpdate(
      { _id: id, userId: session.user.email },
      { 
        $inc: { useCount: 1 },
        lastUsed: new Date()
      },
      { new: true }
    )

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating template usage:', error)
    return NextResponse.json({ error: 'Failed to update usage' }, { status: 500 })
  }
}
