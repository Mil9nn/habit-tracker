// Calorie calculation utilities based on Mifflin-St Jeor Equation and TDEE

interface CalorieCalculationInputs {
  age: number;
  gender: 'male' | 'female';
  weight: number; // kg
  height: number; // cm
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';
}

export function calculateBMR(inputs: CalorieCalculationInputs): number {
  const { age, gender, weight, height } = inputs;
  
  // Mifflin-St Jeor Equation
  if (gender === 'male') {
    return 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  } else {
    return 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  }
}

export function calculateTDEE(bmr: number, activityLevel: string): number {
  const activityMultipliers: Record<string, number> = {
    'sedentary': 1.2,
    'lightly_active': 1.375,
    'moderately_active': 1.55,
    'very_active': 1.725,
    'extra_active': 1.9
  };
  
  return bmr * (activityMultipliers[activityLevel] || 1.2);
}

export function calculateDailyCalorieNeeds(inputs: CalorieCalculationInputs): number {
  const bmr = calculateBMR(inputs);
  const tdee = calculateTDEE(bmr, inputs.activityLevel);
  
  // Round to nearest 50 calories for practical purposes
  return Math.round(tdee / 50) * 50;
}

export function getCalorieGoalInfo(currentGoal: number, calculatedNeeds: number) {
  const difference = currentGoal - calculatedNeeds;
  const percentage = Math.round((currentGoal / calculatedNeeds) * 100);
  
  return {
    currentGoal,
    calculatedNeeds,
    difference,
    percentage,
    isDeficit: difference < 0,
    isSurplus: difference > 0,
    recommendation: difference < -500 ? 'Aggressive deficit - be careful' :
                 difference > 500 ? 'Large surplus - consider exercise' :
                 difference < -200 ? 'Moderate deficit - good for weight loss' :
                 difference > 200 ? 'Moderate surplus - monitor closely' :
                                 'Balanced - maintainable goals'
  };
}
