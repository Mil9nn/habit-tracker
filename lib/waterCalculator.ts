import { IUserProfile } from '@/lib/models/UserProfile'

export interface WaterCalculationFactors {
  baseWater: number
  activityMultiplier: number
  climateMultiplier: number
  dietAdjustment: number
  totalRecommended: number
}

export function calculateWaterIntake(profile: IUserProfile): WaterCalculationFactors {
  // Base water calculation: Body weight (kg) × 0.033 = liters
  const baseWaterLiters = profile.weightKg * 0.033
  const baseWaterMl = Math.round(baseWaterLiters * 1000)

  // Activity level multipliers
  const activityMultipliers = {
    sedentary: 1.0,      // Desk job, little to no exercise
    light: 1.1,          // Light exercise/sports 1-3 days/week
    moderate: 1.2,       // Moderate exercise/sports 3-5 days/week
    active: 1.3,         // Hard exercise/sports 6-7 days a week
    very_active: 1.4     // Very hard exercise/sports & physical job
  }

  // Climate multipliers
  const climateMultipliers = {
    cold: 0.95,          // Cold climates - slightly less water needed
    moderate: 1.0,       // Moderate temperatures
    hot: 1.15,           // Hot environments
    very_hot: 1.25       // Very hot environments (like Indian summers)
  }

  const activityMultiplier = activityMultipliers[profile.activityLevel]
  const climateMultiplier = climateMultipliers[profile.climate]

  // Diet adjustments (in ml)
  let dietAdjustment = 0
  
  // Factors that increase water need
  if (profile.dietPreferences.highProtein) dietAdjustment += 200
  if (profile.dietPreferences.salty) dietAdjustment += 300
  if (profile.dietPreferences.spicy) dietAdjustment += 150
  if (profile.dietPreferences.caffeine) dietAdjustment += 250
  
  // Factors that decrease water need (hydrating foods)
  if (profile.dietPreferences.fruits) dietAdjustment -= 100
  if (profile.dietPreferences.vegetables) dietAdjustment -= 100
  if (profile.dietPreferences.soups) dietAdjustment -= 150

  // Calculate total recommended water
  let totalRecommended = baseWaterMl
  totalRecommended = Math.round(totalRecommended * activityMultiplier)
  totalRecommended = Math.round(totalRecommended * climateMultiplier)
  totalRecommended += dietAdjustment

  // Ensure minimum of 1500ml and maximum of 6000ml for safety
  totalRecommended = Math.max(1500, Math.min(6000, totalRecommended))

  return {
    baseWater: baseWaterMl,
    activityMultiplier,
    climateMultiplier,
    dietAdjustment,
    totalRecommended
  }
}

export function getWaterIntakeExplanation(profile: IUserProfile, factors: WaterCalculationFactors): string {
  const { baseWater, activityMultiplier, climateMultiplier, dietAdjustment, totalRecommended } = factors
  
  let explanation = `Based on your profile:\n\n`
  explanation += `📊 Base calculation: ${profile.weightKg}kg × 0.033 = ${(baseWater/1000).toFixed(1)}L\n`
  
  if (activityMultiplier !== 1.0) {
    explanation += `🏃 Activity level (${profile.activityLevel}): ×${activityMultiplier}\n`
  }
  
  if (climateMultiplier !== 1.0) {
    explanation += `🌡️ Climate (${profile.climate}): ×${climateMultiplier}\n`
  }
  
  if (dietAdjustment !== 0) {
    const adjustmentText = dietAdjustment > 0 ? '+' : ''
    explanation += `🍽️ Diet adjustment: ${adjustmentText}${dietAdjustment}ml\n`
  }
  
  explanation += `\n💧 **Total recommended: ${(totalRecommended/1000).toFixed(1)}L per day**`
  
  return explanation
}
