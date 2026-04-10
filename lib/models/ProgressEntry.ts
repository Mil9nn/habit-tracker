import mongoose from 'mongoose';

const ProgressEntrySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  images: [{
    type: String,
    required: true
  }],
  weight: {
    type: Number,
    min: 0,
    max: 1000
  },
  note: {
    type: String,
    maxlength: 500,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

// Prevent model overwrite during hot reload
export const ProgressEntry = mongoose.models.ProgressEntry || mongoose.model('ProgressEntry', ProgressEntrySchema);
