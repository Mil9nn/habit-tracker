import mongoose from 'mongoose'
import { WaterLogSchema } from './WaterLog'
import { WaterGoalSchema } from './WaterGoals'
import { UserProfileSchema } from './UserProfile'
import { MealLogSchema } from './MealLog'

// Cache models to prevent multiple compilation
const models: any = {}

export const getWaterLogModel = () => {
  if (!models.WaterLog) {
    try {
      models.WaterLog = mongoose.model('WaterLog', WaterLogSchema)
    } catch (error) {
      // Model already compiled, return existing model
      return mongoose.model('WaterLog')
    }
  }
  return models.WaterLog
}

export const getWaterGoalModel = () => {
  if (!models.WaterGoal) {
    try {
      models.WaterGoal = mongoose.model('WaterGoal', WaterGoalSchema)
    } catch (error) {
      // Model already compiled, return existing model
      return mongoose.model('WaterGoal')
    }
  }
  return models.WaterGoal
}

export const getUserProfileModel = () => {
  if (!models.UserProfile) {
    try {
      models.UserProfile = mongoose.model('UserProfile', UserProfileSchema)
    } catch (error) {
      // Model already compiled, return existing model
      return mongoose.model('UserProfile')
    }
  }
  return models.UserProfile
}

export const getMealLogModel = () => {
  if (!models.MealLog) {
    try {
      const modelName = 'MealLog'
      models.MealLog = mongoose.model(modelName, MealLogSchema)
    } catch (error) {
      // Model already compiled, return existing model
      return mongoose.model('MealLog')
    }
  }
  return models.MealLog
}
