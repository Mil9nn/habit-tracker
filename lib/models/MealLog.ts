import mongoose, { Schema, Document } from "mongoose";

export interface FoodItem {
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  micros: {
    vitamins: {
      vitaminA: number;
      vitaminC: number;
      vitaminD: number;
      vitaminB6: number;
      vitaminB7: number;
      vitaminB12: number;
    };
    minerals: {
      iron: number;
      magnesium: number;
      zinc: number;
      calcium: number;
      potassium: number;
      sodium: number;
    };
    other: {
      cholesterol: number;
      sugar: number;
    };
  };
  mealType?: string;
  confidence?: number;
}

export interface IMealLog extends Document {
  userId: string;
  date: Date;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  inputText: string;
  foods: FoodItem[];
  totals: {
    calories: number;
    macros: {
      protein: number;
      carbs: number;
      fat: number;
      fiber: number;
    };
    micros: {
      vitamins: {
        vitaminA: number;
        vitaminC: number;
        vitaminD: number;
        vitaminB6: number;
        vitaminB7: number;
        vitaminB12: number;
      };
      minerals: {
        iron: number;
        magnesium: number;
        zinc: number;
        calcium: number;
        potassium: number;
        sodium: number;
      };
      other: {
        cholesterol: number;
        sugar: number;
      };
    };
  };
  method: 'ai' | 'manual';
  createdAt: Date;
  updatedAt: Date;
}

const MicroSchema = new mongoose.Schema({
  vitamins: {
    vitaminA: Number, vitaminC: Number, vitaminD: Number,
    vitaminB6: Number, vitaminB7: Number, vitaminB12: Number,
  },
  minerals: {
    iron: Number, magnesium: Number, zinc: Number,
    calcium: Number, potassium: Number, sodium: Number,
  },
  other: { cholesterol: Number, sugar: Number },
}, { _id: false })

const MacroSchema = new mongoose.Schema({
  protein: Number, carbs: Number, fat: Number, fiber: Number,
}, { _id: false })

const FoodItemSchema = new mongoose.Schema({
  name:       { type: String, required: true },
  quantity:   { type: Number, required: true },
  unit:       { type: String, required: true },
  calories:   { type: Number, required: true },
  mealType:   { type: String, enum: ['breakfast','lunch','dinner','snack'] },
  confidence: { type: Number, min: 0, max: 1 },
  macros:     MacroSchema,
  micros:     MicroSchema,
}, { _id: false })

const TotalsSchema = new mongoose.Schema({
  calories: Number,
  macros:   MacroSchema,
  micros:   MicroSchema,
}, { _id: false })

export const MealLogSchema = new mongoose.Schema({
  userId:    { type: String, required: true, index: true },
  date:      { type: Date, required: true, index: true },     // store as midnight UTC
  mealType:  { type: String, enum: ['breakfast','lunch','dinner','snack'], index: true },
  inputText: String,                                           // original user description
  foods:     [FoodItemSchema],
  totals:    TotalsSchema,
  method:    { type: String, default: 'ai' },
}, { timestamps: true })   // adds createdAt + updatedAt

// Compound index — most common query: "all meals for user on date"
MealLogSchema.index({ userId: 1, date: -1 })
MealLogSchema.index({ userId: 1, date: -1, mealType: 1 })

export default mongoose.models.MealLog || mongoose.model('MealLog', MealLogSchema)
