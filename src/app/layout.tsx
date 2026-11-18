import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Checkplaca | Consulta veicular clara",
  description: "Entenda o formato da placa e conheça as opções de consulta veicular da Checkplaca.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
