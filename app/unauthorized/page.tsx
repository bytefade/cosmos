"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Unauthorized() {
  useEffect(() => {
    console.log("Acessou página de erro: chave inválida ou ausente");
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center bg-gray-100">
      <h1 className="text-4xl text-red-600 mb-4 font-bold">Acesso Negado</h1>
      <p className="text-lg text-gray-700 max-w-md mb-6">
        Você precisa fornecer uma chave válida na URL para acessar o sistema.
        Exemplo:
        <code className="bg-gray-200 px-2 py-1 rounded">
          ?key=sua-chave-secreta
        </code>
      </p>
      <p className="text-gray-600 mb-8">
        Se você acredita que isso é um erro, entre em contato com o
        administrador.
      </p>
      <Link
        href="/"
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold"
      >
        Voltar para a Página Inicial
      </Link>
    </div>
  );
}
