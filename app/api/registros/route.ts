import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../lib/db";
import Registro from "../../../models/Registro";

interface RegistroData {
  _id?: string;
  category: string;
  description: string;
  details: string;
}

interface CountResponse {
  Um: number;
  Dois: number;
  Três: number;
}

const checkAuth = (req: NextRequest) => {
  const key = req.headers.get("x-auth-key");
  return key === process.env.SECRET_KEY;
};

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const action = searchParams.get("action") || "";

  try {
    await connectDB();

    if (action === "count") {
      const counts: CountResponse = await Registro.aggregate([
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            category: "$_id",
            count: 1,
          },
        },
      ]).then((result) =>
        result.reduce(
          (acc, curr) => ({
            ...acc,
            [curr.category]: curr.count,
          }),
          { Um: 0, Dois: 0, Três: 0 },
        ),
      );

      return NextResponse.json(counts, { status: 200 });
    }

    const query: {
      category?: string;
      description?: { $regex: string; $options: string };
    } = {};
    if (category) {
      query.category = category;
    }
    if (search) {
      query.description = { $regex: search, $options: "i" };
    }

    const registros = await Registro.find(query)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Registro.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        registros,
        total,
        page,
        totalPages,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Erro ao buscar registros:", error);
    return NextResponse.json(
      { error: "Erro ao buscar registros" },
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
    const body: RegistroData = await req.json();

    if (!body.category || !body.description || !body.details) {
      return NextResponse.json(
        { error: "Campos obrigatórios ausentes" },
        { status: 400 },
      );
    }

    const registro = new Registro({
      category: body.category,
      description: body.description,
      details: body.details,
    });

    await registro.save();
    return NextResponse.json(registro, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar registro:", error);
    return NextResponse.json(
      { error: "Erro ao criar registro" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 401 });
  }

  try {
    await connectDB();
    const body: RegistroData = await req.json();

    if (!body._id || !body.category || !body.description || !body.details) {
      return NextResponse.json(
        { error: "Campos obrigatórios ausentes" },
        { status: 400 },
      );
    }

    const registro = await Registro.findByIdAndUpdate(
      body._id,
      {
        category: body.category,
        description: body.description,
        details: body.details,
      },
      { new: true },
    );

    if (!registro) {
      return NextResponse.json(
        { error: "Registro não encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json(registro, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar registro:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar registro" },
      { status: 500 },
    );
  }
}
