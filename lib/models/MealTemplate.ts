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
