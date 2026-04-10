import mongoose, { Schema, model, Types } from 'mongoose'

const MacroSchema = new Schema({
  protein: Number,
  carbs:   Number,
  fat:     Number,
  fiber:   Number,
}, { _id: false })

const MicroSchema = new Schema({
  vitamins: {
    vitaminA: Number, vitaminC: Number, vitaminD: Number,
    vitaminB6: Number, vitaminB7: Number, vitaminB12: Number,
  },
  minerals: {
    iron: Number, magnesium: Number, zinc: Number,
    calcium: Number, potassium: Number, sodium: Number,
  },
  other: { cholesterol: Number, sugar: Number },
}, { _id: false })

const FoodItemSchema = new Schema({
  name:       { type: String, required: true },
  quantity:   { type: Number, required: true },
  unit:       { type: String, required: true },
  calories:   { type: Number, required: true },
  macros:     MacroSchema,
  micros:     MicroSchema,
}, { _id: false })

const MealLogSchema = new Schema({
  userId:    { type: String, required: true, index: true },
  date:      { type: Date, required: true, index: true },     // store as midnight UTC
  mealType:  {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: true,
    index: true,
  },
  inputText: { type: String },   // original user prompt, useful for debugging
  foods:     { type: [FoodItemSchema], default: [] },
  totals: {
    calories: Number,
    macros:   MacroSchema,
    micros:   MicroSchema,
  },
  method: { type: String, default: 'ai' },
}, { timestamps: true })   // adds createdAt + updatedAt

// Compound index — most common query: "all meals for user on date"
MealLogSchema.index({ userId: 1, date: -1 })
MealLogSchema.index({ userId: 1, date: -1, mealType: 1 })

export default mongoose.models.MealLog || model('MealLog', MealLogSchema)
