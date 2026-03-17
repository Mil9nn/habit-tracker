import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

// Food database with approximate calorie values
const foodDatabase = {
  // Fruits
  'banana': { caloriesPerUnit: 105, unit: 'medium', category: 'fruit' },
  'apple': { caloriesPerUnit: 95, unit: 'medium', category: 'fruit' },
  'orange': { caloriesPerUnit: 62, unit: 'medium', category: 'fruit' },
  'grapes': { caloriesPerUnit: 62, unit: 'cup', category: 'fruit' },
  
  // Proteins
  'egg': { caloriesPerUnit: 78, unit: 'large', category: 'protein' },
  'chicken breast': { caloriesPerUnit: 165, unit: '100g', category: 'protein' },
  'protein shake': { caloriesPerUnit: 120, unit: 'scoop', category: 'protein' },
  'paneer': { caloriesPerUnit: 265, unit: '100g', category: 'protein' },
  'dal': { caloriesPerUnit: 113, unit: 'cup', category: 'protein' },
  
  // Grains/Carbs
  'rice': { caloriesPerUnit: 130, unit: 'cup', category: 'carb' },
  'chapati': { caloriesPerUnit: 70, unit: 'piece', category: 'carb' },
  'roti': { caloriesPerUnit: 70, unit: 'piece', category: 'carb' },
  'bread': { caloriesPerUnit: 80, unit: 'slice', category: 'carb' },
  'oats': { caloriesPerUnit: 158, unit: 'cup', category: 'carb' },
  
  // Vegetables
  'phoolgobi': { caloriesPerUnit: 25, unit: 'cup', category: 'vegetable' },
  'cauliflower': { caloriesPerUnit: 25, unit: 'cup', category: 'vegetable' },
  'potato': { caloriesPerUnit: 130, unit: 'medium', category: 'vegetable' },
  'tomato': { caloriesPerUnit: 22, unit: 'medium', category: 'vegetable' },
  'onion': { caloriesPerUnit: 44, unit: 'medium', category: 'vegetable' },
  
  // Dairy
  'milk': { caloriesPerUnit: 103, unit: 'cup', category: 'dairy' },
  'yogurt': { caloriesPerUnit: 100, unit: 'cup', category: 'dairy' },
  'cheese': { caloriesPerUnit: 113, unit: 'slice', category: 'dairy' },
  
  // Common Indian dishes
  'samosa': { caloriesPerUnit: 150, unit: 'piece', category: 'snack' },
  'paratha': { caloriesPerUnit: 150, unit: 'piece', category: 'carb' },
  'idli': { caloriesPerUnit: 58, unit: 'piece', category: 'carb' },
  'dosa': { caloriesPerUnit: 133, unit: 'piece', category: 'carb' },
  'biryani': { caloriesPerUnit: 290, unit: 'cup', category: 'meal' },
  'curry': { caloriesPerUnit: 150, unit: 'cup', category: 'meal' },
}

// Fallback calculation when OpenAI is not available
function calculateCaloriesLocally(foodDescription: string) {
  const foods = foodDescription.toLowerCase().split(/,|\band\b/).map(f => f.trim()).filter(f => f)
  const analyzedFoods = []
  let totalCalories = 0

  for (const foodText of foods) {
    // Extract quantity and food name
    const match = foodText.match(/^(\d+)\s*(.+)$/)
    let quantity = 1
    let foodName = foodText

    if (match) {
      quantity = parseInt(match[1])
      foodName = match[2].trim()
    }

    // Find food in database
    const foodData = Object.entries(foodDatabase).find(([key]) => 
      foodName.includes(key) || key.includes(foodName)
    )

    if (foodData) {
      const [key, data] = foodData
      const calories = data.caloriesPerUnit * quantity
      totalCalories += calories
      
      analyzedFoods.push({
        name: foodName,
        quantity,
        unit: data.unit,
        calories,
        category: data.category,
        confidence: 0.7
      })
    } else {
      // Fallback estimation
      const estimatedCalories = quantity * 50 // Rough estimate
      totalCalories += estimatedCalories
      
      analyzedFoods.push({
        name: foodName,
        quantity,
        unit: 'serving',
        calories: estimatedCalories,
        category: 'unknown',
        confidence: 0.3
      })
    }
  }

  return {
    foods: analyzedFoods,
    totalCalories,
    method: 'local'
  }
}

export async function POST(req: Request) {
  const session = await getServerSession()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { foodDescription, mealType } = await req.json()

    if (!foodDescription || !mealType) {
      return NextResponse.json({ error: 'Food description and meal type are required' }, { status: 400 })
    }

    // Try OpenAI API first
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are a nutrition expert. Analyze food descriptions and calculate calories. 
              
              Return ONLY a JSON response with this exact structure:
              {
                "foods": [
                  {
                    "name": "food name",
                    "quantity": number,
                    "unit": "serving unit",
                    "calories": number,
                    "category": "category"
                  }
                ],
                "totalCalories": number,
                "confidence": "high|medium|low"
              }
              
              Be accurate and realistic. Use standard nutritional values.`
            },
            {
              role: 'user',
              content: `Analyze this meal and calculate calories: "${foodDescription}"`
            }
          ],
          temperature: 0.3,
          max_tokens: 500
        })
      })

      if (response.ok) {
        const data = await response.json()
        const aiResponse = JSON.parse(data.choices[0].message.content)
        
        // Add meal type to each food
        aiResponse.foods = aiResponse.foods.map((food: any) => ({
          ...food,
          mealType,
          confidence: aiResponse.confidence === 'high' ? 0.9 : aiResponse.confidence === 'medium' ? 0.7 : 0.5
        }))

        return NextResponse.json({
          ...aiResponse,
          method: 'ai'
        })
      }
    } catch (aiError) {
      console.log('OpenAI API failed, using local calculation:', aiError)
    }

    // Fallback to local calculation
    const localResult = calculateCaloriesLocally(foodDescription)
    
    // Add meal type to each food
    localResult.foods = localResult.foods.map(food => ({
      ...food,
      mealType
    }))

    return NextResponse.json(localResult)

  } catch (error) {
    console.error('Error analyzing food:', error)
    return NextResponse.json({ error: 'Failed to analyze food' }, { status: 500 })
  }
}
