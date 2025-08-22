import mongoose, { Schema } from "mongoose";

const RegistroSchema = new Schema({
  category: {
    type: String,
    required: true,
    enum: ["Mundo Uno", "Mundo DUO", "Mundo TRINO"],
  },
  description: { type: String, required: true },
  details: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Registro ||
  mongoose.model("Registro", RegistroSchema);
