import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "../components/layout/Navbar";

export const metadata: Metadata = {
  title: "OSLab",
  description: "Interactive Operating Systems Concept Visualizer",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100 antialiased">
        <Navbar />
        <main className="mx-auto w-full max-w-7xl px-4 py-8 md:px-6">{children}</main>
      </body>
    </html>
  );
}
