import mongoose, { Schema } from 'mongoose';

const schema = new Schema({
  publicId: { type: String, required: true, unique: true },
  url: { type: String, required: true },
  name: { type: String, required: true },
  alt: { type: String, default: '' },
  width: Number, height: Number, bytes: Number, uploadedBy: String,
}, { timestamps: true });

export const MediaAsset = mongoose.models.MediaAsset || mongoose.model('MediaAsset', schema);
