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

// Função para formatar o campo description
const formatDescription = (description: string): string => {
  // Apenas converte para caixa alta
  return description.toUpperCase().trim();
};

// POST: Salvar novo registro
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 401 });
  }
  try {
    await connectDB();
    const body = await req.json();

    // Valida campos obrigatórios
    if (!body.description) {
      return NextResponse.json(
        { error: "Descrição é obrigatória" },
        { status: 400 },
      );
    }
    if (!body.category) {
      return NextResponse.json(
        { error: "Categoria é obrigatória" },
        { status: 400 },
      );
    }

    // Aplica formatação ao campo description
    body.description = formatDescription(body.description);

    // Verifica se a descrição formatada é válida
    if (!body.description) {
      return NextResponse.json(
        { error: "Descrição inválida após formatação" },
        { status: 400 },
      );
    }

    const novo = new Registro(body);
    await novo.save();
    return NextResponse.json(novo, { status: 201 });
  } catch (error) {
    console.error("Erro ao salvar registro:", error);
    return NextResponse.json(
      { error: "Erro interno ao salvar registro" },
      { status: 500 },
    );
  }
}

// PUT: Atualizar registro existente
export async function PUT(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 401 });
  }
  try {
    await connectDB();
    const body = await req.json();

    // Valida campos obrigatórios
    if (!body._id) {
      return NextResponse.json(
        { error: "ID do registro é obrigatório" },
        { status: 400 },
      );
    }
    if (!body.description) {
      return NextResponse.json(
        { error: "Descrição é obrigatória" },
        { status: 400 },
      );
    }
    if (!body.category) {
      return NextResponse.json(
        { error: "Categoria é obrigatória" },
        { status: 400 },
      );
    }

    // Aplica formatação ao campo description
    body.description = formatDescription(body.description);

    // Verifica se a descrição formatada é válida
    if (!body.description) {
      return NextResponse.json(
        { error: "Descrição inválida após formatação" },
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
      { new: true, runValidators: true },
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
      { error: "Erro interno ao atualizar registro" },
      { status: 500 },
    );
  }
}

// GET: Listar registros ou contar por categoria
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 401 });
  }
  try {
    await connectDB();
    const { searchParams } = req.nextUrl;
    const action = searchParams.get("action");

    if (action === "count") {
      // Contagem por categoria
      const counts = await Registro.aggregate([
        {
          $group: {
            _id: "$category",
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            category: "$_id",
            count: 1,
            _id: 0,
          },
        },
      ]);

      // Formata a resposta como objeto
      const countMap: { [key: string]: number } = { Um: 0, Dois: 0, Três: 0 };
      counts.forEach((item: { category: string; count: number }) => {
        countMap[item.category] = item.count;
      });

      return NextResponse.json(countMap);
    }

    // Listagem de registros com busca, filtro e paginação
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

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
      .skip(skip)
      .limit(limit);
    const total = await Registro.countDocuments(query);

    return NextResponse.json({
      registros,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Erro ao processar requisição:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar requisição" },
      { status: 500 },
    );
  }
}
