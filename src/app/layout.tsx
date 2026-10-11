import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Kalan · Toute l'école dans une seule application",
  description:
    "Kalan est une application de gestion scolaire : élèves, enseignants, parents et direction, tous connectés.",
};

// Nearly every page reads live data from the SQLite database (including
// dropdowns fed by other sections, e.g. the class list on the student form),
// so pages are rendered per-request rather than statically cached at build time.
export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
