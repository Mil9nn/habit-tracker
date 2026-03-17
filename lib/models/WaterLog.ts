import mongoose, { Schema, Document } from "mongoose";

export interface IWaterLog extends Document {
  userId: string;
  amountMl: number;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const WaterLogSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    amountMl: { type: Number, required: true },
    date: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
);
