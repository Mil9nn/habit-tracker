import mongoose, { Schema, Document } from "mongoose";

export interface ICalorieLog extends Document {
  userId: string;
  foodName: string;
  calories: number;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  quantity?: number;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const CalorieLogSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    foodName: { type: String, required: true },
    calories: { type: Number, required: true },
    mealType: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack'], required: true },
    quantity: { type: Number },
    timestamp: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
);
