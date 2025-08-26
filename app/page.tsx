"use client";

import { useState, FormEvent, useEffect, useCallback } from "react";
import {
  FaSave,
  FaSearch,
  FaArrowLeft,
  FaArrowRight,
  FaEdit,
} from "react-icons/fa";
import Link from "next/link";

interface Registro {
  _id: string;
  category: string;
  description: string;
  details: string;
  createdAt: string;
}

interface ApiResponse {
  registros: Registro[];
  total: number;
  page: number;
  totalPages: number;
}

interface CountResponse {
  Um: number;
  Dois: number;
  Três: number;
}

export default function Home() {
  const [category, setCategory] = useState("Um");
  const [description, setDescription] = useState("");
  const [details, setDetails] = useState("");
  const [registros, setRegistros] = useState<Registro[]>([]);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [counts, setCounts] = useState<CountResponse>({
    Um: 0,
    Dois: 0,
    Três: 0,
  });

  const fetchRegistros = useCallback(
    async (urlKey: string, s = search, cat = filterCategory, p = page) => {
      try {
        const res = await fetch(
          `/api/registros?key=${urlKey}&search=${encodeURIComponent(s)}&category=${encodeURIComponent(cat)}&page=${p}&limit=10`,
        );
        if (res.ok) {
          const data: ApiResponse = await res.json();
          setRegistros(data.registros);
          setTotalPages(data.totalPages);
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
    [search, filterCategory, page],
  );

  const fetchCounts = useCallback(async (urlKey: string) => {
    try {
      const res = await fetch(`/api/registros?key=${urlKey}&action=count`);
      if (res.ok) {
        const data: CountResponse = await res.json();
        setCounts(data);
      } else {
        setError("Erro ao carregar contagem de registros.");
      }
    } catch (err) {
      console.error("Erro ao carregar contagem:", err);
      setError(
        "Erro ao conectar com a API para contagem. Verifique sua conexão.",
      );
    }
  }, []);

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
    fetchCounts(urlKey);
  }, [fetchRegistros, fetchCounts]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!key) {
      setError("Chave não fornecida. Adicione ?key=sua-chave-secreta na URL.");
      return;
    }
    try {
      const url = editingId
        ? `/api/registros?key=${key}`
        : `/api/registros?key=${key}`;
      const method = editingId ? "PUT" : "POST";
      const body = editingId
        ? { _id: editingId, category, description, details }
        : { category, description, details };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setDescription("");
        setDetails("");
        setCategory("Um");
        setEditingId(null); // Sai do modo de edição
        setPage(1); // Volta para a primeira página
        fetchRegistros(key);
        fetchCounts(key); // Atualiza contagem após salvar/editar
        setError("");
      } else {
        const errorData = await res.json();
        setError(
          errorData.error ||
            `Erro ao ${editingId ? "atualizar" : "salvar"} registro.`,
        );
      }
    } catch (err) {
      console.error("Erro ao salvar/atualizar:", err);
      setError(
        "Erro ao salvar/atualizar registro. Verifique sua conexão ou tente novamente.",
      );
    }
  };

  const handleEdit = (registro: Registro) => {
    setEditingId(registro._id);
    setCategory(registro.category);
    setDescription(registro.description);
    setDetails(registro.details);
    // Rola suavemente para o formulário
    const form = document.getElementById("registro-form");
    if (form) {
      form.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setCategory("Um");
    setDescription("");
    setDetails("");
    setError("");
  };

  const handleSearch = () => {
    setPage(1); // Reseta para a primeira página ao buscar
    fetchRegistros(key, search, filterCategory, 1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      fetchRegistros(key, search, filterCategory, newPage);
    }
  };

  // Formata o campo description em tempo real
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value.toUpperCase().trim());
  };

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
          id="registro-form"
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow-md mb-8"
        >
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Tipo</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option>Um</option>
              <option>Dois</option>
              <option>Três</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">
              Descrição
            </label>
            <input
              type="text"
              value={description}
              onChange={handleDescriptionChange}
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
          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <FaSave /> {editingId ? "Atualizar" : "Salvar"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        {/* Busca e Filtro */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Lista de Registros
            </h2>
            <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500 text-white">
                Um: {counts.Um}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-500 text-white">
                Dois: {counts.Dois}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-500 text-white">
                Três: {counts.Três}
              </span>
            </div>
          </div>
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
                <option>Um</option>
                <option>Dois</option>
                <option>Três</option>
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
                className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition relative"
              >
                <button
                  onClick={() => handleEdit(reg)}
                  className="absolute top-2 right-2 text-gray-600 hover:text-blue-600 transition"
                  title="Editar"
                >
                  <FaEdit />
                </button>
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

        {/* Paginação */}
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              page === 1
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            <FaArrowLeft /> Anterior
          </button>
          <span className="text-gray-700">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              page === totalPages
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Próximo <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
  );
}
