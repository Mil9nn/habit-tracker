import mongoose, { Schema, Document } from "mongoose";

export interface IWaterGoal extends Document {
  userId: string;
  targetMl: number;
  createdAt: Date;
  updatedAt: Date;
}

const WaterGoalSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    targetMl: { type: Number, required: true, default: 2000 },
  },
  {
    timestamps: true,
  }
);

export const WaterGoal = mongoose.model<IWaterGoal>("WaterGoal", WaterGoalSchema);
