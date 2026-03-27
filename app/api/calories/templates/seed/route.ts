import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { connectDB } from '@/lib/mongoose'
import { MealTemplate } from '@/lib/models/MealTemplate'

export async function POST() {
  try {
    const session = await getServerSession()
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()
    
    // Sample templates for testing
    const sampleTemplates = [
      {
        userId: session.user.email,
        name: "Quick Oatmeal Breakfast",
        mealType: "breakfast",
        mealItems: [
          { name: "Rolled Oats", quantity: 1, calories: 150, protein: 5, carbs: 27, fat: 3 },
          { name: "Banana", quantity: 1, calories: 105, protein: 1.3, carbs: 27, fat: 0.4 },
          { name: "Almond Milk", quantity: 1, calories: 30, protein: 1, carbs: 1, fat: 2.5 }
        ],
        totalCalories: 285,
        totalProtein: 7.3,
        totalCarbs: 55,
        totalFat: 5.9,
        useCount: 0
      },
      {
        userId: session.user.email,
        name: "Chicken Salad Lunch",
        mealType: "lunch",
        mealItems: [
          { name: "Grilled Chicken Breast", quantity: 150, calories: 248, protein: 46, carbs: 0, fat: 5 },
          { name: "Mixed Greens", quantity: 2, calories: 20, protein: 2, carbs: 4, fat: 0 },
          { name: "Olive Oil Dressing", quantity: 1, calories: 120, protein: 0, carbs: 0, fat: 14 }
        ],
        totalCalories: 388,
        totalProtein: 48,
        totalCarbs: 4,
        totalFat: 19,
        useCount: 0
      },
      {
        userId: session.user.email,
        name: "Protein Shake Snack",
        mealType: "snack",
        mealItems: [
          { name: "Whey Protein", quantity: 1, calories: 120, protein: 25, carbs: 3, fat: 2 },
          { name: "Banana", quantity: 0.5, calories: 53, protein: 0.7, carbs: 13.5, fat: 0.2 },
          { name: "Almond Milk", quantity: 1, calories: 30, protein: 1, carbs: 1, fat: 2.5 }
        ],
        totalCalories: 203,
        totalProtein: 26.7,
        totalCarbs: 17.5,
        totalFat: 4.7,
        useCount: 0
      }
    ]

    // Insert sample templates
    await MealTemplate.insertMany(sampleTemplates)

    return NextResponse.json({ message: 'Sample templates created successfully' })
  } catch (error) {
    console.error('Error creating sample templates:', error)
    return NextResponse.json({ error: 'Failed to create templates' }, { status: 500 })
  }
}
