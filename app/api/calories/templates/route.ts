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

    // Handle both old and new structures
    let processedMealItems = mealItems
    let totals

    // Check if mealItems have nested structure or flat structure
    const hasNestedStructure = mealItems.some((item: any) => item.macros)

    if (!hasNestedStructure) {
      // Convert old flat structure to new nested structure
      processedMealItems = mealItems.map((item: any) => ({
        name: item.name,
        quantity: item.quantity || 1,
        unit: item.unit || 'serving',
        calories: item.calories,
        macros: {
          protein: item.protein || 0,
          carbs: item.carbs || 0,
          fat: item.fat || 0,
          fiber: item.fiber || 0
        },
        micros: {
          vitamins: item.vitamins || {},
          minerals: item.minerals || {},
          other: {
            cholesterol: item.cholesterol || 0,
            sugar: item.sugar || 0
          }
        }
      }))
    }

    // Calculate totals using nested structure
    totals = processedMealItems.reduce((acc: any, item: any) => {
      acc.calories += item.calories || 0
      
      // Sum macros
      if (item.macros) {
        acc.macros.protein += item.macros.protein || 0
        acc.macros.carbs += item.macros.carbs || 0
        acc.macros.fat += item.macros.fat || 0
        acc.macros.fiber += item.macros.fiber || 0
      }
      
      // Sum micros
      if (item.micros) {
        // Sum vitamins
        if (item.micros.vitamins) {
          Object.keys(item.micros.vitamins).forEach(vitamin => {
            acc.micros.vitamins[vitamin] = (acc.micros.vitamins[vitamin] || 0) + (item.micros.vitamins[vitamin] || 0)
          })
        }
        
        // Sum minerals
        if (item.micros.minerals) {
          Object.keys(item.micros.minerals).forEach(mineral => {
            acc.micros.minerals[mineral] = (acc.micros.minerals[mineral] || 0) + (item.micros.minerals[mineral] || 0)
          })
        }
        
        // Sum other
        if (item.micros.other) {
          acc.micros.other.cholesterol += item.micros.other.cholesterol || 0
          acc.micros.other.sugar += item.micros.other.sugar || 0
        }
      }
      
      return acc
    }, {
      calories: 0,
      macros: { protein: 0, carbs: 0, fat: 0, fiber: 0 },
      micros: { 
        vitamins: {}, 
        minerals: {}, 
        other: { cholesterol: 0, sugar: 0 } 
      }
    })

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
    
    try {
      // Create template data with both old and new field names for compatibility
      const templateData: any = {
        userId: session.user.email,
        name: name.trim(),
        mealType,
        mealItems: processedMealItems,
        totals
      }
      
      // Add backward compatibility fields in case old schema is still cached
      templateData.totalCalories = totals.calories
      templateData.totalProtein = totals.macros.protein
      templateData.totalCarbs = totals.macros.carbs
      templateData.totalFat = totals.macros.fat
      templateData.totalFiber = totals.macros.fiber
      templateData.totalCholesterol = totals.micros.other.cholesterol
      templateData.totalSugar = totals.micros.other.sugar
      templateData.totalVitamins = totals.micros.vitamins
      templateData.totalMinerals = totals.micros.minerals
      
      const template = await MealTemplate.create(templateData)
      
      return NextResponse.json({ template })
    } catch (dbError: any) {
      console.error('Database error creating template:', dbError)
      console.error('Error details:', dbError.message)
      console.error('Error stack:', dbError.stack)
      return NextResponse.json({ 
        error: 'Database error: ' + dbError.message,
        details: dbError.stack
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error creating meal template:', error)
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
  }
}
