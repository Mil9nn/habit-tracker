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

                  "macros": {
                    "protein": number,
                    "carbs": number,
                    "fat": number,
                    "fiber": number,
                  },

                  "micros": {
                    "vitamins": {
                      "vitaminA": number,
                      "vitaminC": number,
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
                      "sodium": number,
                    },
                    "other": {
                      "cholesterol": number,
                      "sugar": number,
                    },
                  }
                }
              ],

              "totals": {
                "calories": number,

                "macros": {
                  "protein": number,
                  "carbs": number,
                  "fat": number,
                  "fiber": number,
                },

                "micros": {
                  "vitamins": {
                    "vitaminA": number,
                    "vitaminC": number,
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
                    "sodium": number,
                  },
                  "other": {
                    "cholesterol": number,
                    "sugar": number,
                  },
                }
              }
            }

            Be accurate and realistic. Use standard nutritional values.
            Protein: 4 calories per gram, Carbs: 4 calories per gram, Fat: 9 calories per gram.
            Provide micro-nutrient values in appropriate units (mg, mcg, IU) based on standard nutrition data.`
          },
          {
            role: 'user',
            content: `Analyze this meal and calculate calories, macronutrients, and key micro-nutrients: "${foodDescription}"`
          }
        ],
        temperature: 0.3,
        max_tokens: 700
      })
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to analyze food with AI' }, { status: 500 })
    }

    const data = await response.json()
    
    // Clean JSON response by removing trailing commas
    const cleanedJson = data.choices[0].message.content
      .replace(/,\s*}/g, '}')  // Remove trailing commas before }
      .replace(/,\s*]/g, ']')  // Remove trailing commas before ]
      .replace(/,(\s*[\]}])/g, '$1')  // Remove any comma before closing brackets
    
    const aiResponse = JSON.parse(cleanedJson)

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
