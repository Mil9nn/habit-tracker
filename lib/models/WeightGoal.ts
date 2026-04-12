import mongoose from 'mongoose'

const WeightGoalSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
    index: true
  },
  targetWeight: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    enum: ['kg', 'lbs'],
    required: true
  },
  startDate: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})


export default mongoose.models.WeightGoal || mongoose.model('WeightGoal', WeightGoalSchema)
