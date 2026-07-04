import React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AudioProvider } from "@/components/audio/AudioContext";
import { AuthProvider } from "@/components/auth/AuthContext";
import Player from "@/components/audio/Player";
import Sidebar from "../components/Sidebar";

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
      <body className={`${inter.className} bg-black text-zinc-400 h-screen w-screen overflow-hidden flex flex-col`}>
        <AuthProvider>
          <AudioProvider>
            
            {/* ZONE PRINCIPALE : On utilise flex-1 pour prendre tout l'espace restant */}
            <div className="flex flex-1 overflow-hidden relative">
              
              <Sidebar />

              {/* CONTENU (Inbox) : Scroll indépendant */}
              <main className="flex-1 bg-black relative overflow-hidden w-full flex flex-col">
                {children}
              </main>

            </div>

            {/* LECTEUR : Hauteur fixe 90px, bordure fine au dessus */}
            <div className="h-22.5 bg-[#050505] border-t border-[#222] z-50 shrink-0 w-full">
               <div className="h-full w-full flex flex-col justify-center">
                  <Player /> 
               </div>
            </div>

          </AudioProvider>
        </AuthProvider>
      </body>
    </html>
  );
}