import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

// Food database with approximate nutritional values
const foodDatabase = {
  // Fruits
  'banana': { caloriesPerUnit: 105, unit: 'medium', category: 'fruit', protein: 1.3, carbs: 27, fat: 0.4 },
  'apple': { caloriesPerUnit: 95, unit: 'medium', category: 'fruit', protein: 0.5, carbs: 25, fat: 0.3 },
  'orange': { caloriesPerUnit: 62, unit: 'medium', category: 'fruit', protein: 1.2, carbs: 15, fat: 0.2 },
  'grapes': { caloriesPerUnit: 62, unit: 'cup', category: 'fruit', protein: 0.6, carbs: 16, fat: 0.2 },
  
  // Proteins
  'egg': { caloriesPerUnit: 78, unit: 'large', category: 'protein', protein: 6, carbs: 0.6, fat: 5.3 },
  'chicken breast': { caloriesPerUnit: 165, unit: '100g', category: 'protein', protein: 31, carbs: 0, fat: 3.6 },
  'protein shake': { caloriesPerUnit: 120, unit: 'scoop', category: 'protein', protein: 24, carbs: 3, fat: 1 },
  'paneer': { caloriesPerUnit: 265, unit: '100g', category: 'protein', protein: 18, carbs: 2, fat: 21 },
  'dal': { caloriesPerUnit: 113, unit: 'cup', category: 'protein', protein: 8, carbs: 20, fat: 0.7 },
  
  // Grains/Carbs
  'rice': { caloriesPerUnit: 130, unit: 'cup', category: 'carb', protein: 2.7, carbs: 28, fat: 0.3 },
  'chapati': { caloriesPerUnit: 70, unit: 'piece', category: 'carb', protein: 2, carbs: 15, fat: 0.4 },
  'roti': { caloriesPerUnit: 70, unit: 'piece', category: 'carb', protein: 2, carbs: 15, fat: 0.4 },
  'bread': { caloriesPerUnit: 80, unit: 'slice', category: 'carb', protein: 3, carbs: 15, fat: 1 },
  'oats': { caloriesPerUnit: 158, unit: 'cup', category: 'carb', protein: 6, carbs: 28, fat: 3 },
  
  // Vegetables
  'phoolgobi': { caloriesPerUnit: 25, unit: 'cup', category: 'vegetable', protein: 2, carbs: 5, fat: 0.1 },
  'cauliflower': { caloriesPerUnit: 25, unit: 'cup', category: 'vegetable', protein: 2, carbs: 5, fat: 0.1 },
  'potato': { caloriesPerUnit: 130, unit: 'medium', category: 'vegetable', protein: 3, carbs: 30, fat: 0.2 },
  'tomato': { caloriesPerUnit: 22, unit: 'medium', category: 'vegetable', protein: 1.1, carbs: 4.8, fat: 0.2 },
  'onion': { caloriesPerUnit: 44, unit: 'medium', category: 'vegetable', protein: 1.2, carbs: 10, fat: 0.1 },
  
  // Dairy
  'milk': { caloriesPerUnit: 103, unit: 'cup', category: 'dairy', protein: 8, carbs: 12, fat: 2.4 },
  'yogurt': { caloriesPerUnit: 100, unit: 'cup', category: 'dairy', protein: 9, carbs: 12, fat: 2 },
  'cheese': { caloriesPerUnit: 113, unit: 'slice', category: 'dairy', protein: 7, carbs: 1, fat: 9 },
  
  // Common Indian dishes
  'samosa': { caloriesPerUnit: 150, unit: 'piece', category: 'snack', protein: 4, carbs: 25, fat: 5 },
  'paratha': { caloriesPerUnit: 150, unit: 'piece', category: 'carb', protein: 4, carbs: 25, fat: 5 },
  'idli': { caloriesPerUnit: 58, unit: 'piece', category: 'carb', protein: 2, carbs: 12, fat: 0.2 },
  'dosa': { caloriesPerUnit: 133, unit: 'piece', category: 'carb', protein: 3, carbs: 25, fat: 3 },
  'biryani': { caloriesPerUnit: 290, unit: 'cup', category: 'meal', protein: 12, carbs: 45, fat: 8 },
  'curry': { caloriesPerUnit: 150, unit: 'cup', category: 'meal', protein: 8, carbs: 20, fat: 5 },
}

// Fallback calculation when OpenAI is not available
function calculateCaloriesLocally(foodDescription: string) {
  const foods = foodDescription.toLowerCase().split(/,|\band\b/).map(f => f.trim()).filter(f => f)
  const analyzedFoods = []
  let totalCalories = 0
  let totalProtein = 0
  let totalCarbs = 0
  let totalFat = 0

  for (const foodText of foods) {
    // Extract quantity and food name
    const match = foodText.match(/^(\d+)\s*(.+)$/)
    let quantity = 1
    let foodName = foodText

    if (match) {
      quantity = parseInt(match[1])
      foodName = match[2].trim()
    }

    // Find food in database with improved matching
    let foodData = Object.entries(foodDatabase).find(([key]) => 
      foodName.includes(key) || key.includes(foodName)
    )
    
    // If no match found, try singularizing the food name
    if (!foodData && foodName.endsWith('s')) {
      const singularFoodName = foodName.slice(0, -1)
      foodData = Object.entries(foodDatabase).find(([key]) => 
        singularFoodName.includes(key) || key.includes(singularFoodName)
      )
    }
    
    // If still no match, try removing common suffixes
    if (!foodData) {
      const cleanedFoodName = foodName.replace(/(?:es|s)$/i, '').trim()
      if (cleanedFoodName !== foodName) {
        foodData = Object.entries(foodDatabase).find(([key]) => 
          cleanedFoodName.includes(key) || key.includes(cleanedFoodName)
        )
      }
    }

    if (foodData) {
      const [key, data] = foodData
      const calories = data.caloriesPerUnit * quantity
      const protein = (data.protein || 0) * quantity
      const carbs = (data.carbs || 0) * quantity
      const fat = (data.fat || 0) * quantity
      
      totalCalories += calories
      totalProtein += protein
      totalCarbs += carbs
      totalFat += fat
      
      analyzedFoods.push({
        name: foodName,
        quantity,
        unit: data.unit,
        calories,
        protein,
        carbs,
        fat,
        category: data.category,
        confidence: 0.7
      })
    } else {
      // Fallback estimation
      const estimatedCalories = quantity * 50 // Rough estimate
      const estimatedProtein = quantity * 2 // Rough estimate
      const estimatedCarbs = quantity * 8 // Rough estimate
      const estimatedFat = quantity * 1 // Rough estimate
      
      totalCalories += estimatedCalories
      totalProtein += estimatedProtein
      totalCarbs += estimatedCarbs
      totalFat += estimatedFat
      
      analyzedFoods.push({
        name: foodName,
        quantity,
        unit: 'serving',
        calories: estimatedCalories,
        protein: estimatedProtein,
        carbs: estimatedCarbs,
        fat: estimatedFat,
        category: 'unknown',
        confidence: 0.3
      })
    }
  }

  return {
    foods: analyzedFoods,
    totalCalories,
    totalProtein,
    totalCarbs,
    totalFat,
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
              content: `You are a nutrition expert. Analyze food descriptions and calculate calories and macronutrients. 
              
              Return ONLY a JSON response with this exact structure:
              {
                "foods": [
                  {
                    "name": "food name",
                    "quantity": number,
                    "unit": "serving unit",
                    "calories": number,
                    "protein": number,
                    "carbs": number,
                    "fat": number,
                    "category": "category"
                  }
                ],
                "totalCalories": number,
                "totalProtein": number,
                "totalCarbs": number,
                "totalFat": number,
                "confidence": "high|medium|low"
              }
              
              Be accurate and realistic. Use standard nutritional values. 
              Protein: 4 calories per gram, Carbs: 4 calories per gram, Fat: 9 calories per gram.`
            },
            {
              role: 'user',
              content: `Analyze this meal and calculate calories and macronutrients (protein, carbs, fat): "${foodDescription}"`
            }
          ],
          temperature: 0.3,
          max_tokens: 250
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
