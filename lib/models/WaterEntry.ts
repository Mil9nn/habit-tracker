import mongoose, { Schema, Document } from "mongoose";

export interface IWaterEntry extends Document {
  userId: string;
  amount: number;
  unit: string;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WaterEntrySchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    amount: { type: Number, required: true },
    unit: { type: String, required: true, default: "ml" },
    date: { type: Date, required: true, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export const WaterEntry = mongoose.model<IWaterEntry>("WaterEntry", WaterEntrySchema);