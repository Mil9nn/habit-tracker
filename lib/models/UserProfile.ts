import mongoose, { Schema, Document } from "mongoose";

export interface IUserProfile extends Document {
  userId: string;
  age: number;
  gender: 'male' | 'female';
  weight: number;
  height: number;
  activityLevel: 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extra_active';
  dailyCalorieGoal: number;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const UserProfileSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    age: { type: Number, required: true, min: 18, max: 100 },
    gender: { type: String, enum: ['male', 'female'], required: true },
    weight: { type: Number, required: true, min: 30, max: 300 },
    height: { type: Number, required: true, min: 100, max: 250 },
    activityLevel: { 
      type: String, 
      required: true, 
      enum: ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extra_active'] 
    },
    dailyCalorieGoal: { type: Number, required: true, min: 1000, max: 5000 },
    image: { type: String },
  },
  {
    timestamps: true,
  }
);
