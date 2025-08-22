import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../lib/db";
import Registro from "../../../models/Registro";

const checkAuth = (req: NextRequest) => {
  const key = req.nextUrl.searchParams.get("key");
  return key === process.env.SECRET_KEY;
};

// Interface for MongoDB query
interface RegistroQuery {
  category?: string;
  $or?: Array<{ [key: string]: { $regex: string; $options: string } }>;
}

// POST: Salvar novo registro
export async function POST(req: NextRequest) {
  if (!checkAuth(req))
    return NextResponse.json({ error: "Acesso negado" }, { status: 401 });
  await connectDB();
  const body = await req.json();
  const novo = new Registro(body);
  await novo.save();
  return NextResponse.json(novo, { status: 201 });
}

// GET: Listar com busca e filtro
export async function GET(req: NextRequest) {
  if (!checkAuth(req))
    return NextResponse.json({ error: "Acesso negado" }, { status: 401 });
  await connectDB();
  const { searchParams } = req.nextUrl;
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";

  const query: RegistroQuery = {};
  if (category) query.category = category;
  if (search) {
    query.$or = [
      { description: { $regex: search, $options: "i" } },
      { details: { $regex: search, $options: "i" } },
      { category: { $regex: search, $options: "i" } },
    ];
  }

  const registros = await Registro.find(query)
    .sort({ createdAt: -1 })
    .limit(50); // Últimos 50
  return NextResponse.json(registros);
}
