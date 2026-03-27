import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectDB } from '@/lib/mongoose'
import { MealTemplate } from '@/lib/models/MealTemplate'

// GET: Fetch user's meal templates
export async function GET() {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    
    const templates = await MealTemplate.find({ userId: session.user.email })
      .sort({ useCount: -1, lastUsed: -1 })
      .limit(20)

    return NextResponse.json({ templates })
  } catch (error) {
    console.error('Error fetching meal templates:', error)
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
  }
}

// POST: Create new meal template
export async function POST(request: Request) {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, mealType, mealItems } = await request.json()

    if (!name || !mealType || !mealItems || mealItems.length === 0) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Calculate totals
    const totalCalories = mealItems.reduce((sum: number, item: any) => sum + item.calories, 0)
    const totalProtein = mealItems.reduce((sum: number, item: any) => sum + (item.protein || 0), 0)
    const totalCarbs = mealItems.reduce((sum: number, item: any) => sum + (item.carbs || 0), 0)
    const totalFat = mealItems.reduce((sum: number, item: any) => sum + (item.fat || 0), 0)

    await connectDB()
    
    // Check if template with same name already exists for this user
    const existingTemplate = await MealTemplate.findOne({ 
      userId: session.user.email, 
      name: name.trim() 
    })

    if (existingTemplate) {
      return NextResponse.json({ 
        error: 'Template with this name already exists',
        existingTemplate: existingTemplate
      }, { status: 409 })
    }
    
    const template = await MealTemplate.create({
      userId: session.user.email,
      name: name.trim(),
      mealType,
      mealItems,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat
    })

    return NextResponse.json({ template })
  } catch (error) {
    console.error('Error creating meal template:', error)
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
  }
}
