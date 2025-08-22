"use client";

import { useState, FormEvent, useEffect, useCallback } from "react";
import { FaSave, FaSearch } from "react-icons/fa";
import Link from "next/link";

interface Registro {
  _id: string;
  category: string;
  description: string;
  details: string;
  createdAt: string;
}

export default function Home() {
  const [category, setCategory] = useState("Mundo Uno");
  const [description, setDescription] = useState("");
  const [details, setDetails] = useState("");
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [key, setKey] = useState("");
  const [error, setError] = useState("");

  const fetchRegistros = useCallback(
    async (urlKey: string, s = search, cat = filterCategory) => {
      try {
        const res = await fetch(
          `/api/registros?key=${urlKey}&search=${encodeURIComponent(s)}&category=${encodeURIComponent(cat)}`,
        );
        if (res.ok) {
          const data = await res.json();
          setRegistros(data);
          setError("");
        } else {
          setError(
            "Erro ao carregar registros: Chave inválida ou problema na API.",
          );
        }
      } catch (err) {
        console.error("Erro na requisição:", err);
        setError(
          "Erro ao conectar com a API. Verifique sua conexão ou tente novamente.",
        );
      }
    },
    [search, filterCategory],
  );

  useEffect(() => {
    const urlKey = new URLSearchParams(window.location.search).get("key");
    if (!urlKey) {
      setError(
        "Por favor, adicione ?key=sua-chave-secreta na URL para acessar.",
      );
      return;
    }
    setKey(urlKey);
    fetchRegistros(urlKey);
  }, [fetchRegistros]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!key) {
      setError("Chave não fornecida. Adicione ?key=sua-chave-secreta na URL.");
      return;
    }
    try {
      const res = await fetch(`/api/registros?key=${key}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, description, details }),
      });
      if (res.ok) {
        setDescription("");
        setDetails("");
        fetchRegistros(key);
        setError("");
      } else {
        setError("Erro ao salvar registro: Chave inválida ou problema na API.");
      }
    } catch (err) {
      console.error("Erro ao salvar:", err);
      setError(
        "Erro ao salvar registro. Verifique sua conexão ou tente novamente.",
      );
    }
  };

  const handleSearch = () => fetchRegistros(key, search, filterCategory);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Erro</h1>
        <p className="text-gray-700 mb-6">{error}</p>
        <Link
          href="/"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Voltar
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 drop-shadow-md">
            Cosmos
          </h1>
        </div>

        {/* Formulário */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow-md mb-8"
        >
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Categoria
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Mundo Uno</option>
              <option>Mundo DUO</option>
              <option>Mundo TRINO</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Descrição
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Detalhes
            </label>
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-y"
            />
          </div>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <FaSave /> Salvar
          </button>
        </form>

        {/* Busca e Filtro */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Lista de Registros
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Busca..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex-1">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option>Mundo Uno</option>
                <option>Mundo DUO</option>
                <option>Mundo TRINO</option>
              </select>
            </div>
            <button
              onClick={handleSearch}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              <FaSearch /> Buscar
            </button>
          </div>
        </div>

        {/* Lista de Registros */}
        <div className="space-y-4">
          {registros.length === 0 ? (
            <p className="text-gray-500 text-center">
              Nenhum registro encontrado.
            </p>
          ) : (
            registros.map((reg) => (
              <div
                key={reg._id}
                className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition"
              >
                <h3 className="text-lg font-semibold text-gray-800">
                  {reg.category}
                </h3>
                <p className="text-gray-700">{reg.description}</p>
                <p className="text-gray-600 mt-2">{reg.details}</p>
                <p className="text-sm text-gray-400 mt-2">
                  {new Date(reg.createdAt).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
