import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cosmos",
  description: "App para registro de ideias",
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
