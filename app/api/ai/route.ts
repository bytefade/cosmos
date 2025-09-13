import { NextRequest, NextResponse } from "next/server";
import connectDB from "../../../lib/db";
import AIConfig from "../../../models/AIConfig";

const checkAuth = (req: NextRequest) => {
  const key = req.nextUrl.searchParams.get("key");
  return key === process.env.SECRET_KEY;
};

// Mock response function
const mockAIResponse = (description: string): string => {
  return `Detalhes gerados para: ${description.toUpperCase()}. Texto de exemplo.`;
};

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 401 });
  }

  try {
    await connectDB();
    const body = await req.json();
    const { description } = body;

    if (!description) {
      return NextResponse.json(
        { error: "Descrição é obrigatória" },
        { status: 400 },
      );
    }

    // Ler configuração de IA
    const config = await AIConfig.findOne({ userId: "default-user" });
    if (!config || !config.token) {
      console.warn("Configuração de IA não encontrada, usando mock.");
      return NextResponse.json(
        { details: mockAIResponse(description) },
        { status: 200 },
      );
    }

    let details: string | null = null;
    const { apiName, token } = config;

    // Chamada à API escolhida
    let response;
    let endpoint;
    let headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
    let payload;

    switch (apiName) {
      case "Hugging Face":
        endpoint =
          "https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1";
        payload = JSON.stringify({
          inputs: `Com base na descrição "${description}", gere um texto detalhado para o campo "Detalhes" (máximo 100 caracteres).`,
          parameters: { max_length: 100, temperature: 0.7 },
        });
        break;
      case "Google Gemini":
        endpoint =
          "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";
        payload = JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Com base na descrição "${description}", gere um texto detalhado para o campo "Detalhes" (máximo 100 caracteres).`,
                },
              ],
            },
          ],
        });
        break;
      case "Groq":
        endpoint = "https://api.groq.com/openai/v1/chat/completions";
        payload = JSON.stringify({
          model: "llama3-8b-8192",
          messages: [
            {
              role: "user",
              content: `Com base na descrição "${description}", gere um texto detalhado para o campo "Detalhes" (máximo 100 caracteres).`,
            },
          ],
          max_tokens: 100,
          temperature: 0.7,
        });
        break;
      default:
        return NextResponse.json(
          { details: mockAIResponse(description) },
          { status: 200 },
        );
    }

    response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: payload,
    });

    if (!response.ok) {
      console.error(
        "Erro na resposta da API de IA:",
        apiName,
        response.status,
        await response.text(),
      );
      return NextResponse.json(
        { details: mockAIResponse(description) },
        { status: 200 },
      );
    }

    const data = await response.json();
    details =
      data.choices[0]?.message?.content?.trim() || mockAIResponse(description);

    return NextResponse.json({ details }, { status: 200 });
  } catch (error) {
    console.error("Erro ao chamar a API de IA:", error);
    return NextResponse.json(
      { details: mockAIResponse(description || "Erro desconhecido") },
      { status: 200 },
    );
  }
}
