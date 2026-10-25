import mongoose, { Schema } from 'mongoose';

const schema = new Schema({
  _id: { type: String, default: 'site' },
  content: { type: Schema.Types.Mixed, required: true },
  revision: { type: Number, default: 0 },
  history: [{ _id: false, section: String, summary: String, by: String, at: Date, revision: Number }],
}, { timestamps: true });

export const ContentDocument = mongoose.models.SiteContent || mongoose.model('SiteContent', schema);
