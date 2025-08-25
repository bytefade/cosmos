import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cosmos",
  description: "App registro mundo UNO, DUO, TRINO",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
