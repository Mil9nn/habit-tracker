import mongoose from 'mongoose';

// Define nested schemas to match MealLog structure
const MacroSchema = new mongoose.Schema({
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fat: { type: Number, default: 0 },
  fiber: { type: Number, default: 0 },
}, { _id: false })

const MicroSchema = new mongoose.Schema({
  vitamins: {
    vitaminA: { type: Number, default: 0 },
    vitaminC: { type: Number, default: 0 },
    vitaminD: { type: Number, default: 0 },
    vitaminB6: { type: Number, default: 0 },
    vitaminB7: { type: Number, default: 0 },
    vitaminB12: { type: Number, default: 0 }
  },
  minerals: {
    iron: { type: Number, default: 0 },
    magnesium: { type: Number, default: 0 },
    zinc: { type: Number, default: 0 },
    calcium: { type: Number, default: 0 },
    potassium: { type: Number, default: 0 },
    sodium: { type: Number, default: 0 }
  },
  other: { 
    cholesterol: { type: Number, default: 0 },
    sugar: { type: Number, default: 0 }
  }
}, { _id: false })

const MealItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  unit: { type: String, default: 'serving' },
  calories: { type: Number, required: true },
  macros: MacroSchema,
  micros: MicroSchema,
}, { _id: false })

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
  mealItems: [MealItemSchema],
  totals: {
    calories: { type: Number, required: true },
    macros: MacroSchema,
    micros: MicroSchema,
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
