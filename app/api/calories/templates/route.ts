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
    const totalFiber = mealItems.reduce((sum: number, item: any) => sum + (item.fiber || 0), 0)
    const totalCholesterol = mealItems.reduce((sum: number, item: any) => sum + (item.cholesterol || 0), 0)
    const totalSugar = mealItems.reduce((sum: number, item: any) => sum + (item.sugar || 0), 0)
    
    // Calculate vitamin totals
    const totalVitamins = mealItems.reduce((totals: any, item: any) => {
      if (item.vitamins) {
        return {
          vitaminA: (totals.vitaminA || 0) + (item.vitamins.vitaminA || 0),
          vitaminC: (totals.vitaminC || 0) + (item.vitamins.vitaminC || 0),
          vitaminD: (totals.vitaminD || 0) + (item.vitamins.vitaminD || 0),
          vitaminE: (totals.vitaminE || 0) + (item.vitamins.vitaminE || 0),
          vitaminK: (totals.vitaminK || 0) + (item.vitamins.vitaminK || 0),
          thiamin: (totals.thiamin || 0) + (item.vitamins.thiamin || 0),
          riboflavin: (totals.riboflavin || 0) + (item.vitamins.riboflavin || 0),
          niacin: (totals.niacin || 0) + (item.vitamins.niacin || 0),
          vitaminB6: (totals.vitaminB6 || 0) + (item.vitamins.vitaminB6 || 0),
          folate: (totals.folate || 0) + (item.vitamins.folate || 0),
          vitaminB12: (totals.vitaminB12 || 0) + (item.vitamins.vitaminB12 || 0),
          vitaminB7: (totals.vitaminB7 || 0) + (item.vitamins.vitaminB7 || 0)
        }
      }
      return totals
    }, {})
    
    // Calculate mineral totals
    const totalMinerals = mealItems.reduce((totals: any, item: any) => {
      if (item.minerals) {
        return {
          calcium: (totals.calcium || 0) + (item.minerals.calcium || 0),
          iron: (totals.iron || 0) + (item.minerals.iron || 0),
          magnesium: (totals.magnesium || 0) + (item.minerals.magnesium || 0),
          phosphorus: (totals.phosphorus || 0) + (item.minerals.phosphorus || 0),
          potassium: (totals.potassium || 0) + (item.minerals.potassium || 0),
          sodium: (totals.sodium || 0) + (item.minerals.sodium || 0),
          zinc: (totals.zinc || 0) + (item.minerals.zinc || 0),
          copper: (totals.copper || 0) + (item.minerals.copper || 0),
          manganese: (totals.manganese || 0) + (item.minerals.manganese || 0),
          selenium: (totals.selenium || 0) + (item.minerals.selenium || 0)
        }
      }
      return totals
    }, {})

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
      totalFat,
      totalFiber,
      totalCholesterol,
      totalSugar,
      totalVitamins,
      totalMinerals
    })

    return NextResponse.json({ template })
  } catch (error) {
    console.error('Error creating meal template:', error)
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
  }
}
