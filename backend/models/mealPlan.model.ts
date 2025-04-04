import mongoose, { Schema, Document, Types } from "mongoose";

export interface IMealPlan extends Document {
  name: string;
  description: string;
  meals: {
    breakfast: mongoose.Types.ObjectId[] | string[];
    lunch: mongoose.Types.ObjectId[] | string[];
    dinner: mongoose.Types.ObjectId[] | string[];
  };
  daysAvailable: string[];
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

const MealPlanSchema = new Schema<IMealPlan>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  meals: {
    breakfast: { type: [Schema.Types.ObjectId], ref: 'Meal', required: true },
    lunch: { type: [Schema.Types.ObjectId], ref: 'Meal', required: true },
    dinner: { type: [Schema.Types.ObjectId], ref: 'Meal', required: true },
  },
  daysAvailable: {
    type: [String],
    enum: [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ],
    required: true,
  },
  price: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model<IMealPlan>("MealPlan", MealPlanSchema);
