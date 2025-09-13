import mongoose, { Schema } from 'mongoose';

const AIConfigSchema = new Schema({
  apiName: { type: String, required: true, enum: ['Hugging Face', 'Google Gemini', 'Groq'] },
  token: { type: String, required: true },
  userId: { type: String, required: true }, // Para identificar o usuário, use um ID fixo ou dinâmico
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.AIConfig || mongoose.model('AIConfig', AIConfigSchema);