"use client";

import { useState, FormEvent, useEffect, useCallback } from "react";
import {
  FaSave,
  FaSearch,
  FaArrowLeft,
  FaArrowRight,
  FaEdit,
  FaRobot,
  FaCog,
} from "react-icons/fa";
import { useRouter } from "next/navigation";

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

interface AIConfig {
  apiName: string;
  token: string;
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
  const [aiConfig, setAIConfig] = useState<AIConfig | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAPI, setSelectedAPI] = useState("Hugging Face");
  const [token, setToken] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const authKey = sessionStorage.getItem("authKey") || "";
      if (!authKey) {
        router.push("/unauthorized");
        return;
      }
      setKey(authKey);
    }
  }, [router]);

  const fetchRegistros = useCallback(
    async (s = search, cat = filterCategory, p = page) => {
      if (!key) return;
      try {
        const res = await fetch(
          `/api/registros?search=${encodeURIComponent(s)}&category=${encodeURIComponent(cat)}&page=${p}&limit=10`,
          {
            headers: { "x-auth-key": key },
          },
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
    [search, filterCategory, page, key],
  );

  const fetchCounts = useCallback(async () => {
    if (!key) return;
    try {
      const res = await fetch(`/api/registros?action=count`, {
        headers: { "x-auth-key": key },
      });
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
  }, [key]);

  const fetchAIConfig = useCallback(async () => {
    if (!key) return;
    try {
      const res = await fetch(`/api/ai-config`, {
        headers: { "x-auth-key": key },
      });
      if (res.ok) {
        const data: AIConfig = await res.json();
        setAIConfig(data);
      } else {
        setAIConfig(null);
      }
    } catch (err) {
      console.error("Erro ao carregar configuração de IA:", err);
      setAIConfig(null);
    }
  }, [key]);

  const saveAIConfig = async () => {
    if (!token) {
      setError("Token é obrigatório.");
      return;
    }
    try {
      const res = await fetch(`/api/ai-config`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-key": key,
        },
        body: JSON.stringify({ apiName: selectedAPI, token }),
      });
      if (res.ok) {
        setAIConfig({ apiName: selectedAPI, token });
        setIsModalOpen(false);
        setError("");
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Erro ao salvar configuração.");
      }
    } catch (err) {
      console.error("Erro ao salvar configuração:", err);
      setError("Erro ao salvar configuração de IA.");
    }
  };

  const fetchAIDetails = async () => {
    if (!description) {
      setError("Descrição é necessária para gerar detalhes com IA.");
      return;
    }
    if (!key) {
      setError("Chave não fornecida.");
      return;
    }
    try {
      const res = await fetch(`/api/ai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-auth-key": key,
        },
        body: JSON.stringify({ description }),
      });
      if (res.ok) {
        const data = await res.json();
        setDetails(data.details);
        setError("");
      } else {
        const errorData = await res.json();
        setError(errorData.error || "Erro ao gerar detalhes com IA.");
      }
    } catch (err) {
      console.error("Erro ao chamar IA:", err);
      setError("Erro ao conectar com a API de IA.");
    }
  };

  useEffect(() => {
    if (key) {
      fetchRegistros();
      fetchCounts();
      fetchAIConfig();
    }
  }, [key, fetchRegistros, fetchCounts, fetchAIConfig]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!key) {
      setError("Chave não fornecida.");
      return;
    }
    try {
      const url = editingId ? `/api/registros` : `/api/registros`;
      const method = editingId ? "PUT" : "POST";
      const body = editingId
        ? { _id: editingId, category, description, details }
        : { category, description, details };

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-auth-key": key,
        },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setDescription("");
        setDetails("");
        setCategory("Um");
        setEditingId(null);
        setPage(1);
        fetchRegistros();
        fetchCounts();
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
    setPage(1);
    fetchRegistros(search, filterCategory, 1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      fetchRegistros(search, filterCategory, newPage);
    }
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value.toUpperCase().trim());
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Erro</h1>
        <p className="text-gray-700 mb-6">{error}</p>
        <button
          onClick={() => router.push("/unauthorized")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Voltar
        </button>
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
            <div className="flex gap-2">
              <input
                type="text"
                value={description}
                onChange={handleDescriptionChange}
                required
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={fetchAIDetails}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                disabled={!description || !aiConfig}
                title="Gerar detalhes com IA"
              >
                <FaRobot /> IA it!
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                title="Configurar IA"
              >
                <FaCog />
              </button>
            </div>
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

        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 backdrop-blur-sm z-50 transition-opacity duration-300">
            <div className="bg-white p-6 rounded-xl shadow-xl max-w-md w-full sm:w-11/12 transform transition-all duration-300 scale-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Configurar IA
              </h2>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Escolha a API
                </label>
                <select
                  value={selectedAPI}
                  onChange={(e) => setSelectedAPI(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option>Hugging Face</option>
                  <option>Google Gemini</option>
                  <option>Groq</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Token da API
                </label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Insira o token da API escolhida"
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={saveAIConfig}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Salvar
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

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
