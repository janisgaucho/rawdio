"use client";

import React from "react";
import { useAuth } from "@/components/auth/AuthContext";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Player from "@/components/audio/Player";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();

  if (!user) {
    // Si l'utilisateur n'est pas connecté, on affiche uniquement le contenu de la page
    // (ce sera la LandingPage) dans une div qui prend tout l'écran.
    return (
      <div className="h-screen w-screen overflow-y-auto">
        {children}
      </div>
    );
  }

  // Si l'utilisateur est connecté, on affiche la structure complète de l'application
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col">
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />
        <main className="flex-1 bg-black relative overflow-hidden w-full flex flex-col">
          <Header />
          <div className="flex-1 overflow-y-auto px-8 pb-40">{children}</div>
        </main>
      </div>

      <div className="h-22.5 bg-[#050505] border-t border-[#222] z-50 shrink-0 w-full">
        <div className="h-full w-full flex flex-col justify-center">
          <Player />
        </div>
      </div>
    </div>
  );
}