import mongoose, { Schema, Document } from "mongoose";

export interface FoodItem {
  name: string;
  quantity: number;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  vitamins?: {
    vitaminA?: number;
    vitaminC?: number;
    vitaminD?: number;
    vitaminB6?: number;
    vitaminB7?: number;
    vitaminB12?: number;
  };
  minerals?: {
    iron?: number;
    magnesium?: number;
    zinc?: number;
    calcium?: number;
    potassium?: number;
    sodium?: number;
  };
  cholesterol?: number;
  sugar?: number;
}

export interface ICalorieLog extends Document {
  userId: string;
  foodName: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  quantity?: number;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
  // New fields for meal support
  isMeal: boolean;
  mealItems?: FoodItem[];
  // Micro-nutrients
  vitamins?: {
    vitaminA?: number;
    vitaminC?: number;
    vitaminD?: number;
    vitaminE?: number;
    vitaminK?: number;
    thiamin?: number;
    riboflavin?: number;
    niacin?: number;
    vitaminB6?: number;
    folate?: number;
    vitaminB12?: number;
  };
  minerals?: {
    calcium?: number;
    iron?: number;
    magnesium?: number;
    phosphorus?: number;
    potassium?: number;
    sodium?: number;
    zinc?: number;
    copper?: number;
    manganese?: number;
    selenium?: number;
  };
  cholesterol?: number;
  sugar?: number;
}

export const CalorieLogSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    foodName: { type: String, required: true },
    calories: { type: Number, required: true },
    protein: { type: Number },        // ✅ Add macro fields
    carbs: { type: Number },         // ✅ Add macro fields
    fat: { type: Number },           // ✅ Add macro fields
    fiber: { type: Number },         // ✅ Add fiber field
    mealType: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack'], required: true },
    quantity: { type: Number },
    timestamp: { type: Date, required: true },
    // New fields for meal support
    isMeal: { type: Boolean, default: false },
    mealItems: [{
      name: { type: String, required: true },
      quantity: { type: Number, required: true },
      calories: { type: Number, required: true },
      protein: { type: Number },
      carbs: { type: Number },
      fat: { type: Number },
      fiber: { type: Number },
      vitamins: {
        vitaminA: { type: Number },
        vitaminC: { type: Number },
        vitaminD: { type: Number },
        vitaminB6: { type: Number },
        vitaminB7: { type: Number },
        vitaminB12: { type: Number }
      },
      minerals: {
        iron: { type: Number },
        magnesium: { type: Number },
        zinc: { type: Number },
        calcium: { type: Number },
        potassium: { type: Number },
        sodium: { type: Number }
      },
      cholesterol: { type: Number },
      sugar: { type: Number }
    }],
    // Micro-nutrients
    vitamins: {
      vitaminA: { type: Number },
      vitaminC: { type: Number },
      vitaminD: { type: Number },
      vitaminE: { type: Number },
      vitaminK: { type: Number },
      thiamin: { type: Number },
      riboflavin: { type: Number },
      niacin: { type: Number },
      vitaminB6: { type: Number },
      folate: { type: Number },
      vitaminB12: { type: Number }
    },
    minerals: {
      calcium: { type: Number },
      iron: { type: Number },
      magnesium: { type: Number },
      phosphorus: { type: Number },
      potassium: { type: Number },
      sodium: { type: Number },
      zinc: { type: Number },
      copper: { type: Number },
      manganese: { type: Number },
      selenium: { type: Number }
    },
    cholesterol: { type: Number },
    sugar: { type: Number }
  },
  {
    timestamps: true,
  }
);
