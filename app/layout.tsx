import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import { AudioProvider } from "@/components/audio/AudioContext";
import { AuthProvider } from "@/components/auth/AuthContext";
import AppLayout from "@/components/library/AppLayout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Rawdio",
  description: "Stockage audio brut",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark">
      {/* On retire les classes de layout du body pour les mettre dans AppLayout */}
      <body className={`${inter.className} bg-black text-zinc-400`}>
        <AuthProvider>
          <AudioProvider>
            <AppLayout>
              {children}
            </AppLayout>
          </AudioProvider>
        </AuthProvider>
      </body>
    </html>
  );
}