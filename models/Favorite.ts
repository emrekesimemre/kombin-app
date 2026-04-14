import { Schema, model, models } from 'mongoose';

const FavoriteSchema = new Schema({
  userEmail: { type: String, required: true }, // <-- Kombini kim kaydettiyse onun e-postası
  mood: String,
  explanation: String,
  clothIds: [{ type: Schema.Types.ObjectId, ref: 'Cloth' }],
}, { timestamps: true });

export const Favorite = models.Favorite || model('Favorite', FavoriteSchema);