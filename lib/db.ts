// import mongoose from "mongoose";

// const connectDB = async () => {
//   if (mongoose.connections[0].readyState) return;
//   await mongoose.connect(process.env.MONGODB_URI as string);
// };

// export default connectDB;
import mongoose from "mongoose";

const connectDB = async () => {
  if (mongoose.connections[0].readyState) {
    console.log("Já conectado ao MongoDB");
    return;
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log("Conexão com MongoDB bem-sucedida");
  } catch (error) {
    console.error("Erro ao conectar ao MongoDB:", error);
    throw error;
  }
};

export default connectDB;
