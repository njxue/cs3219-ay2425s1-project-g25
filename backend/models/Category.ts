// CategoryModel.ts

import mongoose, { Schema, Types, Document } from 'mongoose';
import { Category as SharedCategory } from '@shared/types/Category';  // Import your shared type

export interface Category
  extends Omit<SharedCategory, '_id'>,
    Document {
  _id: Types.ObjectId;
}

// Create the schema for the Category model
const categorySchema: Schema<Category> = new Schema<Category>({
  name: { type: String, required: true, unique: true },
});

// Create the Category model
const categoryModel = mongoose.model<Category>(
  'category',
  categorySchema
);

export default categoryModel;
