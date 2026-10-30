import type { Metadata } from "next";
import Link from "next/link";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Dassault Interview Prep",
  description: "7-day prep for the Business Process Analyst role at Dassault Systèmes Pune",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <header className="border-b" style={{ borderColor: "var(--line)" }}>
          <nav className="mx-auto flex max-w-4xl items-center gap-5 px-4 py-3 text-sm">
            <Link href="/" className="font-bold">Dassault Prep</Link>
            <Link href="/resume" className="muted hover:underline">Resume &amp; fit</Link>
            <Link href="/interview" className="muted hover:underline">Voice interview</Link>
            <Link href="/admin" className="muted ml-auto text-xs hover:underline">Admin</Link>
          </nav>
        </header>
        <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
        <Analytics />
      </body>
    </html>
  );
}
