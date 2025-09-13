import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/db';
import AIConfig from '../../../models/AIConfig';

const checkAuth = (req: NextRequest) => {
  const key = req.nextUrl.searchParams.get('key');
  return key === process.env.SECRET_KEY;
};

// POST: Salvar configuração de IA
export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 401 });
  }
  try {
    await connectDB();
    const body = await req.json();
    const { apiName, token } = body;

    if (!apiName || !token) {
      return NextResponse.json({ error: 'API e token são obrigatórios' }, { status: 400 });
    }

    // Salva ou atualiza a configuração (usando userId fixo para simplicidade)
    const config = await AIConfig.findOneAndUpdate(
      { userId: 'default-user' },
      { apiName, token },
      { upsert: true, new: true }
    );

    return NextResponse.json(config, { status: 200 });
  } catch (error) {
    console.error('Erro ao salvar configuração de IA:', error);
    return NextResponse.json({ error: 'Erro interno ao salvar configuração' }, { status: 500 });
  }
}

// GET: Ler configuração de IA
export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 401 });
  }
  try {
    await connectDB();
    const config = await AIConfig.findOne({ userId: 'default-user' });

    return NextResponse.json(config || {}, { status: 200 });
  } catch (error) {
    console.error('Erro ao ler configuração de IA:', error);
    return NextResponse.json({ error: 'Erro interno ao ler configuração' }, { status: 500 });
  }
}