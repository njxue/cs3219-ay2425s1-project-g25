import { Question as SharedQuestion } from '@shared/types/Question';
import mongoose, { Schema, Types } from 'mongoose';

export interface Question
  extends Omit<SharedQuestion, '_id'>,
    Document {
  _id: Types.ObjectId;
}

const questionSchema: Schema = new Schema<Question>({
  code: {type: Number, required: true, unique: true},
  title: { type: String, required: true },
  description: { type: String, required: true },
  difficulty: { type: String, required: true },
  categories: { type: [String], required: true },
  url: { type: String, required: true },
});

const questionModel = mongoose.model<Question>(
  'question',
  questionSchema
);

export default questionModel;