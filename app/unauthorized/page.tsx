"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Unauthorized() {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!key) {
      setError("Por favor, insira a chave de acesso.");
      return;
    }
    sessionStorage.setItem("authKey", key);
    setError("");
    router.push("/");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "1rem",
        backgroundColor: "#f3f4f6",
        textAlign: "center",
      }}
    >
      <h1
        style={{
          fontSize: "2.25rem",
          fontWeight: 800,
          backgroundClip: "text",
          color: "transparent",
          backgroundImage: "linear-gradient(to right, #2563eb, #7c3aed)",
          textShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          marginBottom: "2rem",
        }}
      >
        Cosmos
      </h1>
      <div
        style={{
          backgroundColor: "#ffffff",
          padding: "1.5rem",
          borderRadius: "0.5rem",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          maxWidth: "28rem",
          width: "100%",
        }}
      >
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: 600,
            color: "#1f2937",
            marginBottom: "1rem",
          }}
        >
          Acesso Restrito
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1rem" }}>
            <label
              style={{
                display: "block",
                color: "#1f2937",
                fontWeight: 500,
                marginBottom: "0.5rem",
              }}
            >
              Chave de Acesso
            </label>
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Insira sua chave de acesso"
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.375rem",
                outline: "none",
                transition: "box-shadow 0.2s",
              }}
              onFocus={(e) => (e.target.style.boxShadow = "0 0 0 2px #3b82f6")}
              onBlur={(e) => (e.target.style.boxShadow = "none")}
            />
          </div>
          {error && (
            <p
              style={{
                color: "#dc2626",
                marginBottom: "1rem",
                textAlign: "center",
              }}
            >
              {error}
            </p>
          )}
          <button
            type="submit"
            style={{
              width: "100%",
              padding: "0.5rem 1rem",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              borderRadius: "0.375rem",
              transition: "background-color 0.2s",
              cursor: "pointer",
              outline: "none",
            }}
            onMouseOver={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.backgroundColor = "#1d4ed8";
            }}
            onMouseOut={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.backgroundColor = "#2563eb";
            }}
            onFocus={(e: React.FocusEvent<HTMLButtonElement>) => {
              e.currentTarget.style.boxShadow = "0 0 0 2px #3b82f6";
            }}
            onBlur={(e: React.FocusEvent<HTMLButtonElement>) => {
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            Acessar
          </button>
        </form>
      </div>
    </div>
  );
}
