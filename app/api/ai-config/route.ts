import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../lib/db";
import AIConfig from "../../../models/AIConfig";

interface RequestBody {
  apiName: string;
  token: string;
}

const checkAuth = (req: NextRequest) => {
  const key = req.headers.get("x-auth-key");
  return key === process.env.SECRET_KEY;
};

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 401 });
  }

  try {
    await connectDB();
    const config = await AIConfig.findOne({ userId: "default-user" });
    return NextResponse.json(config || {}, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar configuração:", error);
    return NextResponse.json(
      { error: "Erro ao buscar configuração" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 401 });
  }

  try {
    await connectDB();
    const body: RequestBody = await req.json();
    const { apiName, token } = body;

    if (!apiName || !token) {
      return NextResponse.json(
        { error: "apiName e token são obrigatórios" },
        { status: 400 },
      );
    }

    const config = await AIConfig.findOneAndUpdate(
      { userId: "default-user" },
      { apiName, token, userId: "default-user" },
      { upsert: true, new: true },
    );

    return NextResponse.json(config, { status: 200 });
  } catch (error) {
    console.error("Erro ao salvar configuração:", error);
    return NextResponse.json(
      { error: "Erro ao salvar configuração" },
      { status: 500 },
    );
  }
}
