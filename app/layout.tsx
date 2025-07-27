// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar"; // 1. Import the Navbar

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 2. I've updated your metadata to be more descriptive
export const metadata: Metadata = {
  title: "StreetSource App",
  description: "AI-powered tools for street food vendors in India.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* 3. This new structure adds the Navbar and centers your content */}
        <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
          <Navbar />
          <main className="flex-grow">
            <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}