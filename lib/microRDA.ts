// Micro-nutrient RDA (Recommended Dietary Allowance) Calculator
// Based on NIH (National Institutes of Health) and WHO standards
// Values are in mg unless specified otherwise (mcg for some vitamins)

export interface UserProfile {
  age: number
  gender: 'male' | 'female'
  weight?: number // kg
  height?: number // cm
  activityLevel?: string
  // Life stage indicators
  isPregnant?: boolean
  isLactating?: boolean
  isAthlete?: boolean
}

export interface MicroRDA {
  // Vitamins (values in mcg unless specified)
  vitaminA: number // mcg RAE
  vitaminB6: number // mg
  vitaminB12: number // mcg
  vitaminC: number // mg
  vitaminD: number // mcg (IU)
  vitaminE: number // mg
  vitaminK: number // mcg
  thiamin: number // mg (B1)
  riboflavin: number // mg (B2)
  niacin: number // mg (B3)
  folate: number // mcg DFE
  pantothenicAcid: number // mg (B5)
  biotin: number // mcg (B7)
  
  // Minerals (values in mg unless specified)
  calcium: number // mg
  iron: number // mg
  magnesium: number // mg
  phosphorus: number // mg
  potassium: number // mg
  sodium: number // mg
  chloride: number // mg
  zinc: number // mg
  copper: number // mg
  manganese: number // mg
  selenium: number // mcg
  iodine: number // mcg
  chromium: number // mcg
  molybdenum: number // mcg
}

/**
 * Calculate RDA for micro-nutrients based on age, gender, and life stage
 * @param profile User profile with age, gender, and life stage indicators
 * @returns Object with RDA values for all micro-nutrients
 */
export function calculateMicroRDA(profile: UserProfile): MicroRDA {
  const { age, gender, isPregnant, isLactating, isAthlete } = profile
  
  // Base RDA values for adult men and women
  const baseRDA = getBaseRDA(age, gender)
  
  // Adjustments for special conditions
  let multiplier = 1.0
  
  if (isPregnant) {
    multiplier = applyPregnancyAdjustments(baseRDA, age)
  } else if (isLactating) {
    multiplier = applyLactationAdjustments(baseRDA, age)
  }
  
  if (isAthlete) {
    multiplier *= 1.1 // 10% increase for athletes
  }
  
  // Apply multiplier to all values
  const adjustedRDA: MicroRDA = {} as MicroRDA
  for (const key in baseRDA) {
    adjustedRDA[key as keyof MicroRDA] = Math.round(
      baseRDA[key as keyof MicroRDA] * multiplier
    )
  }
  
  return adjustedRDA
}

/**
 * Get base RDA values based on age and gender
 */
function getBaseRDA(age: number, gender: 'male' | 'female'): MicroRDA {
  // Adult values (19-50 years)
  const adultMale: MicroRDA = {
    vitaminA: 900,      // mcg RAE
    vitaminB6: 1.3,     // mg
    vitaminB12: 2.4,    // mcg
    vitaminC: 90,       // mg
    vitaminD: 15,       // mcg (600 IU)
    vitaminE: 15,       // mg
    vitaminK: 120,      // mcg
    thiamin: 1.2,       // mg
    riboflavin: 1.3,    // mg
    niacin: 16,         // mg
    folate: 400,        // mcg DFE
    pantothenicAcid: 5, // mg
    biotin: 30,         // mcg
    
    calcium: 1000,      // mg
    iron: 8,            // mg
    magnesium: 400,     // mg
    phosphorus: 700,    // mg
    potassium: 3400,    // mg
    sodium: 1500,       // mg
    chloride: 2300,     // mg
    zinc: 11,           // mg
    copper: 0.9,        // mg
    manganese: 2.3,     // mg
    selenium: 55,       // mcg
    iodine: 150,        // mcg
    chromium: 35,       // mcg
    molybdenum: 45      // mcg
  }
  
  const adultFemale: MicroRDA = {
    vitaminA: 700,      // mcg RAE
    vitaminB6: 1.3,     // mg
    vitaminB12: 2.4,    // mcg
    vitaminC: 75,       // mg
    vitaminD: 15,       // mcg (600 IU)
    vitaminE: 15,       // mg
    vitaminK: 90,       // mcg
    thiamin: 1.1,       // mg
    riboflavin: 1.1,    // mg
    niacin: 14,         // mg
    folate: 400,        // mcg DFE
    pantothenicAcid: 5, // mg
    biotin: 30,         // mcg
    
    calcium: 1000,      // mg
    iron: 18,           // mg (higher for menstruating women)
    magnesium: 310,     // mg
    phosphorus: 700,    // mg
    potassium: 2600,    // mg
    sodium: 1500,       // mg
    chloride: 2300,     // mg
    zinc: 8,           // mg
    copper: 0.9,        // mg
    manganese: 1.8,     // mg
    selenium: 55,       // mcg
    iodine: 150,        // mcg
    chromium: 25,       // mcg
    molybdenum: 45      // mcg
  }
  
  // Adjust for age groups
  let rda = gender === 'male' ? { ...adultMale } : { ...adultFemale }
  
  if (age < 18) {
    rda = adjustForAge(rda, age, gender)
  } else if (age > 50) {
    rda = adjustForOlderAdults(rda, age, gender)
  }
  
  return rda
}

/**
 * Adjust RDA values for children and adolescents
 */
function adjustForAge(baseRDA: MicroRDA, age: number, gender: 'male' | 'female'): MicroRDA {
  const rda = { ...baseRDA }
  
  if (age >= 14 && age < 18) {
    // Adolescents (14-18 years)
    if (gender === 'male') {
      rda.vitaminA = 900
      rda.vitaminC = 75
      rda.calcium = 1300
      rda.iron = 11
      rda.magnesium = 410
      rda.zinc = 11
    } else {
      rda.vitaminA = 700
      rda.vitaminC = 65
      rda.calcium = 1300
      rda.iron = 15
      rda.magnesium = 360
      rda.zinc = 9
    }
  } else if (age >= 9 && age < 14) {
    // Pre-teens (9-13 years)
    rda.vitaminA = gender === 'male' ? 600 : 600
    rda.vitaminC = gender === 'male' ? 45 : 45
    rda.calcium = 1300
    rda.iron = gender === 'male' ? 8 : 8
    rda.magnesium = 240
    rda.zinc = gender === 'male' ? 8 : 8
  } else if (age >= 4 && age < 9) {
    // Children (4-8 years)
    rda.vitaminA = 400
    rda.vitaminC = 25
    rda.calcium = 1000
    rda.iron = 10
    rda.magnesium = 130
    rda.zinc = 5
  } else {
    // Young children (1-3 years)
    rda.vitaminA = 300
    rda.vitaminC = 15
    rda.calcium = 700
    rda.iron = 7
    rda.magnesium = 80
    rda.zinc = 3
  }
  
  return rda
}

/**
 * Adjust RDA values for older adults (50+ years)
 */
function adjustForOlderAdults(baseRDA: MicroRDA, age: number, gender: 'male' | 'female'): MicroRDA {
  const rda = { ...baseRDA }
  
  if (age >= 70) {
    // Older adults (70+ years)
    rda.vitaminD = 20 // 800 IU (increased for bone health)
    rda.calcium = 1200 // increased for osteoporosis prevention
    rda.vitaminB12 = 2.4 // absorption decreases with age
  } else if (age >= 50) {
    // Adults 50-70 years
    rda.vitaminD = 20 // 800 IU
    rda.calcium = gender === 'female' ? 1200 : 1000 // women need more calcium
  }
  
  // Women over 50 need less iron (post-menopausal)
  if (gender === 'female' && age >= 51) {
    rda.iron = 8
  }
  
  return rda
}

/**
 * Apply pregnancy adjustments
 */
function applyPregnancyAdjustments(baseRDA: MicroRDA, age: number): number {
  // Pregnancy requires increased amounts of most nutrients
  const adjustments: { [key: string]: number } = {
    vitaminA: 1.1,
    vitaminB6: 1.3,
    vitaminB12: 1.1,
    vitaminC: 1.2,
    vitaminD: 1.3,
    vitaminE: 1.1,
    folate: 1.5, // significantly higher for neural tube development
    iron: 2.2,    // much higher for increased blood volume
    calcium: 1.3,
    magnesium: 1.2,
    zinc: 1.3,
    iodine: 1.4
  }
  
  // Return average multiplier (simplified approach)
  const values = Object.values(adjustments)
  return values.reduce((sum, val) => sum + val, 0) / values.length
}

/**
 * Apply lactation adjustments
 */
function applyLactationAdjustments(baseRDA: MicroRDA, age: number): number {
  // Lactation requires even more nutrients than pregnancy
  const adjustments: { [key: string]: number } = {
    vitaminA: 1.4,
    vitaminB6: 1.5,
    vitaminB12: 1.3,
    vitaminC: 1.4,
    vitaminD: 1.4,
    vitaminE: 1.3,
    folate: 1.3,
    iron: 1.5,
    calcium: 1.4,
    magnesium: 1.3,
    zinc: 1.4,
    iodine: 1.5
  }
  
  // Return average multiplier (simplified approach)
  const values = Object.values(adjustments)
  return values.reduce((sum, val) => sum + val, 0) / values.length
}

/**
 * Calculate percentage of RDA met
 */
export function calculateRDAPercentage(
  intake: Partial<MicroRDA>,
  rda: MicroRDA
): Partial<Record<keyof MicroRDA, number>> {
  const percentages: Partial<Record<keyof MicroRDA, number>> = {}
  
  for (const key in rda) {
    const nutrient = key as keyof MicroRDA
    const rdaValue = rda[nutrient]
    const intakeValue = intake[nutrient] || 0
    
    percentages[nutrient] = Math.round((intakeValue / rdaValue) * 100)
  }
  
  return percentages
}

/**
 * Get micro-nutrient status based on intake vs RDA
 */
export function getMicroNutrientStatus(
  intake: Partial<MicroRDA>,
  rda: MicroRDA
): {
  nutrient: keyof MicroRDA
  status: 'deficient' | 'adequate' | 'excessive'
  percentage: number
}[] {
  const percentages = calculateRDAPercentage(intake, rda)
  
  return Object.entries(percentages).map(([nutrient, percentage]) => ({
    nutrient: nutrient as keyof MicroRDA,
    status: percentage < 80 ? 'deficient' : percentage > 150 ? 'excessive' : 'adequate',
    percentage
  }))
}

/**
 * Get priority micro-nutrients to focus on
 */
export function getPriorityMicroNutrients(
  intake: Partial<MicroRDA>,
  rda: MicroRDA
): {
  nutrient: keyof MicroRDA
  priority: 'high' | 'medium' | 'low'
  currentIntake: number
  rdaValue: number
  percentage: number
}[] {
  const status = getMicroNutrientStatus(intake, rda)
  
  return status
    .filter(item => item.status === 'deficient')
    .sort((a, b) => a.percentage - b.percentage) // Most deficient first
    .slice(0, 5) // Top 5 priorities
    .map(item => ({
      nutrient: item.nutrient,
      priority: item.percentage < 50 ? 'high' : 'medium' as 'high' | 'medium',
      currentIntake: intake[item.nutrient] || 0,
      rdaValue: rda[item.nutrient],
      percentage: item.percentage
    }))
}
