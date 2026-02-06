import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Studio CAS Settore Legale di Souiai SNC — Consulenza e assistenza",
  description:
    "Sportello informativo per migranti. Prenota una consulenza legale online o in sede. Assistenza amministrativa e mediazione culturale.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className="min-h-screen antialiased font-sans bg-stone-50 text-stone-900">{children}</body>
    </html>
  );
}
