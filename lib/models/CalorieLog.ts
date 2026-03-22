import mongoose, { Schema, Document } from "mongoose";

export interface FoodItem {
  name: string;
  quantity: number;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

export interface ICalorieLog extends Document {
  userId: string;
  foodName: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  quantity?: number;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
  // New fields for meal support
  isMeal: boolean;
  mealItems?: FoodItem[];
}

export const CalorieLogSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    foodName: { type: String, required: true },
    calories: { type: Number, required: true },
    protein: { type: Number },        // ✅ Add macro fields
    carbs: { type: Number },         // ✅ Add macro fields
    fat: { type: Number },           // ✅ Add macro fields
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
      fat: { type: Number }
    }]
  },
  {
    timestamps: true,
  }
);
