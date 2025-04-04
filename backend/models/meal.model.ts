import mongoose, { Schema, Document } from "mongoose";

interface IMeal extends Document {
  name: string;
  description: string;
  type: string;
  vegetarian: boolean;
  vegan: boolean;
  glutenFree: boolean;
  calories: number;
  available: boolean;
  imageUrl?: string;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

const MealSchema = new Schema<IMeal>({
  name: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, required: true },
  vegetarian: { type: Boolean, default: false },
  vegan: { type: Boolean, default: false },
  glutenFree: { type: Boolean, default: false },
  calories: { type: Number, required: true },
  available: { type: Boolean, default: true },
  imageUrl: { type: String },
  price: { type: Number },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Meal = mongoose.model<IMeal>("Meal", MealSchema);

export default Meal;
