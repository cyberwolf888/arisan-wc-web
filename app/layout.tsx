import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { NavLinks } from "@/components/nav-links";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Arisan Bola PELITA",
  description: "Aplikasi Arisan Bola PELITA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <div className="flex min-h-screen flex-col bg-[radial-gradient(circle_at_top,theme(colors.zinc.100),transparent_55%)]">
          <header className="sticky top-0 z-20 border-b border-border/60 bg-background/90 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
              <div className="min-w-0">
                <p className="text-[0.7rem] font-semibold tracking-[0.24em] text-muted-foreground uppercase">
                  Arisan Bola
                </p>
                <p className="truncate text-sm font-semibold tracking-tight">PELITA</p>
              </div>
              <NavLinks />
            </div>
          </header>
          <main className="mx-auto flex w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
            {children}
          </main>
        </div>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
