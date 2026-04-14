import { Schema, model, models } from 'mongoose';

const ClothSchema = new Schema({
  userEmail: { type: String, required: true }, // <-- Kıyafeti kim eklediyse onun e-postası
  imageUrl: String,
  category: String,
  colors: [String],
  season: [String],
  moods: [String],
  tags: [String],
}, { timestamps: true });

export const Cloth = models.Cloth || model('Cloth', ClothSchema);