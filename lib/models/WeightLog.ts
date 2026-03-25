import mongoose from 'mongoose'

const WeightLogSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
    index: true
  },
  weight: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    enum: ['kg', 'lbs'],
    required: true
  },
  date: {
    type: String,
    required: true
  }
}, {
  timestamps: true
})

// Compound index for unique entries per user per date
WeightLogSchema.index({ userEmail: 1, date: 1 }, { unique: true })

export default mongoose.models.WeightLog || mongoose.model('WeightLog', WeightLogSchema)
