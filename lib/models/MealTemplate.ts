import mongoose from 'mongoose';

const MealTemplateSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  mealType: {
    type: String,
    required: true,
    enum: ['breakfast', 'lunch', 'dinner', 'snack']
  },
  mealItems: [{
    name: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      default: 1
    },
    calories: {
      type: Number,
      required: true
    },
    protein: {
      type: Number,
      default: 0
    },
    carbs: {
      type: Number,
      default: 0
    },
    fat: {
      type: Number,
      default: 0
    },
    fiber: {
      type: Number,
      default: 0
    },
    cholesterol: {
      type: Number,
      default: 0
    },
    sugar: {
      type: Number,
      default: 0
    },
    vitamins: {
      vitaminA: { type: Number, default: 0 },
      vitaminC: { type: Number, default: 0 },
      vitaminD: { type: Number, default: 0 },
      vitaminE: { type: Number, default: 0 },
      vitaminK: { type: Number, default: 0 },
      thiamin: { type: Number, default: 0 },
      riboflavin: { type: Number, default: 0 },
      niacin: { type: Number, default: 0 },
      vitaminB6: { type: Number, default: 0 },
      folate: { type: Number, default: 0 },
      vitaminB12: { type: Number, default: 0 },
      vitaminB7: { type: Number, default: 0 }
    },
    minerals: {
      calcium: { type: Number, default: 0 },
      iron: { type: Number, default: 0 },
      magnesium: { type: Number, default: 0 },
      phosphorus: { type: Number, default: 0 },
      potassium: { type: Number, default: 0 },
      sodium: { type: Number, default: 0 },
      zinc: { type: Number, default: 0 },
      copper: { type: Number, default: 0 },
      manganese: { type: Number, default: 0 },
      selenium: { type: Number, default: 0 }
    }
  }],
  totalCalories: {
    type: Number,
    required: true
  },
  totalProtein: {
    type: Number,
    default: 0
  },
  totalCarbs: {
    type: Number,
    default: 0
  },
  totalFat: {
    type: Number,
    default: 0
  },
  totalFiber: {
    type: Number,
    default: 0
  },
  totalCholesterol: {
    type: Number,
    default: 0
  },
  totalSugar: {
    type: Number,
    default: 0
  },
  totalVitamins: {
    vitaminA: { type: Number, default: 0 },
    vitaminC: { type: Number, default: 0 },
    vitaminD: { type: Number, default: 0 },
    vitaminE: { type: Number, default: 0 },
    vitaminK: { type: Number, default: 0 },
    thiamin: { type: Number, default: 0 },
    riboflavin: { type: Number, default: 0 },
    niacin: { type: Number, default: 0 },
    vitaminB6: { type: Number, default: 0 },
    folate: { type: Number, default: 0 },
    vitaminB12: { type: Number, default: 0 },
    vitaminB7: { type: Number, default: 0 }
  },
  totalMinerals: {
    calcium: { type: Number, default: 0 },
    iron: { type: Number, default: 0 },
    magnesium: { type: Number, default: 0 },
    phosphorus: { type: Number, default: 0 },
    potassium: { type: Number, default: 0 },
    sodium: { type: Number, default: 0 },
    zinc: { type: Number, default: 0 },
    copper: { type: Number, default: 0 },
    manganese: { type: Number, default: 0 },
    selenium: { type: Number, default: 0 }
  },
  useCount: {
    type: Number,
    default: 0
  },
  lastUsed: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Prevent model overwrite during hot reload
export const MealTemplate = mongoose.models.MealTemplate || mongoose.model('MealTemplate', MealTemplateSchema);
