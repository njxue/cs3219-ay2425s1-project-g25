import mongoose, { Schema, Types } from 'mongoose';

export interface HistoryEntry extends mongoose.Document {
  _id: Types.ObjectId;
  userId: string;
  question: Types.ObjectId;
  attemptStartedAt: Date;
  attemptCompletedAt: Date;
  collaborator: string;
}

const historyEntrySchema: Schema = new Schema<HistoryEntry>({
  userId: { type: String, required: true },
  question: { type: Schema.Types.ObjectId, ref: 'question', required: true },
  attemptStartedAt: { type: Date, required: true, default: Date.now() },
  attemptCompletedAt: { type: Date, required: true, default: Date.now() },
  collaborator: { type: String, required: true },
});

const historyEntryModel = mongoose.model<HistoryEntry>('historyEntry', historyEntrySchema);
export default historyEntryModel;
