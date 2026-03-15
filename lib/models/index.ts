import mongoose from 'mongoose'

// Cache models to prevent multiple compilation
const models: any = {}

export const getWaterLogModel = () => {
  if (!models.WaterLog) {
    const WaterLogSchema = new mongoose.Schema(
      {
        userId: { type: String, required: true },
        amountMl: { type: Number, required: true },
        date: { type: Date, required: true },
      },
      {
        timestamps: true,
      }
    )
    models.WaterLog = mongoose.model('WaterLog', WaterLogSchema)
  }
  return models.WaterLog
}

export const getWaterGoalModel = () => {
  if (!models.WaterGoal) {
    const WaterGoalSchema = new mongoose.Schema(
      {
        userId: { type: String, required: true, unique: true },
        targetMl: { type: Number, required: true, default: 2000 },
      },
      {
        timestamps: true,
      }
    )
    models.WaterGoal = mongoose.model('WaterGoal', WaterGoalSchema)
  }
  return models.WaterGoal
}
