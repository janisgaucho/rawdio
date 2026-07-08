"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthContext";
import AuthModal from "@/components/auth/AuthModal";
import Dashboard from "@/components/library/Dashboard";
import LandingPage from "@/components/LandingPage";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { user, loading } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Affiche un spinner pendant la vérification de l'état d'authentification
  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-black">
        <Loader2 className="w-12 h-12 text-white/20 animate-spin" />
      </div>
    );
  }

  return (
    <>
      {user ? (
        <Dashboard />
      ) : (
        <LandingPage onAuthClick={() => setIsAuthModalOpen(true)} />
      )}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}