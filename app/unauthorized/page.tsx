"use client";

import { useEffect } from "react";

export default function Unauthorized() {
  useEffect(() => {
    // Opcional: Log ou alerta para debugging
    console.log("Acessou página de erro: chave inválida ou ausente");
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "20px",
        textAlign: "center",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#f8f8f8",
      }}
    >
      <h1
        style={{ color: "#d32f2f", fontSize: "2.5rem", marginBottom: "1rem" }}
      >
        Acesso Negado
      </h1>
      <p style={{ fontSize: "1.2rem", color: "#333", maxWidth: "600px" }}>
        Você precisa fornecer uma chave válida na URL para acessar o sistema.
        Exemplo:
        <code
          style={{
            background: "#eee",
            padding: "2px 6px",
            borderRadius: "4px",
          }}
        >
          ?key=sua-chave-secreta
        </code>
      </p>
      <p style={{ fontSize: "1rem", color: "#666", marginTop: "1rem" }}>
        Se você acredita que isso é um erro, entre em contato com o
        administrador.
      </p>
      <a
        href="/"
        style={{
          marginTop: "2rem",
          padding: "10px 20px",
          backgroundColor: "#1976d2",
          color: "white",
          textDecoration: "none",
          borderRadius: "5px",
          fontWeight: "bold",
        }}
      >
        Voltar para a Página Inicial
      </a>
    </div>
  );
}
