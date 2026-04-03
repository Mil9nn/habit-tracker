import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

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
            content: `You are a nutrition expert. Analyze food descriptions and calculate calories, macronutrients, and key micro-nutrients.

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
                  "category": "category",
                  "vitamins": {
                    
                    "vitaminD": number,
                    "vitaminB6": number,
                    "vitaminB7": number,
                    "vitaminB12": number
                  },
                  "minerals": {
                    "iron": number,
                    "magnesium": number,
                    "zinc": number,
                    "calcium": number,
                    "potassium": number,
                  }
                }
              ],
              "totalCalories": number,
              "totalProtein": number,
              "totalCarbs": number,
              "totalFat": number,
              "totalVitamins": {
                "vitaminA": number,
                "vitaminB6": number,
                "vitaminB12": number
              },
              "totalMinerals": {
                "iron": number,
                "magnesium": number,
                "zinc": number,
                "calcium": number,
                "potassium": number,
              },
              "confidence": "high|medium|low"
            }

            Be accurate and realistic. Use standard nutritional values.
            Protein: 4 calories per gram, Carbs: 4 calories per gram, Fat: 9 calories per gram.
            Provide micro-nutrient values in appropriate units (mg, mcg, IU) based on standard nutrition data.`
          },
          {
            role: 'user',
            content: `Analyze this meal and calculate calories, macronutrients (protein, carbs, fat), and key micro-nutrients (vitamins and minerals): "${foodDescription}"`
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      })
    })

    // log the returned data for debugging
    const debugData = await response.clone().json()
    console.log('AI Response Debug:', JSON.stringify(debugData, null, 2));

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to analyze food with AI' }, { status: 500 })
    }

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

  } catch (error) {
    console.error('Error analyzing food:', error)
    return NextResponse.json({ error: 'Failed to analyze food' }, { status: 500 })
  }
}
