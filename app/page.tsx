"use client";

import { useState } from "react";
import Link from "next/link";
import TrackList from "@/components/library/TrackList";
import UploadZone from "@/components/library/UploadZone"; // <--- C'est lui qui manquait !
import { Heart, LogIn, LogOut, MoreVertical, User, CreditCard, HardDrive } from "lucide-react";
import { useAudio } from "@/components/audio/AudioContext";
import { useAuth } from "@/components/auth/AuthContext";
import AuthModal from "@/components/auth/AuthModal";

export default function Home() {
  const { playlist } = useAudio();
  const { user, logout } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const favorites = playlist.filter((track: any) => track.isFavorite);

  return (
    <div className="h-full w-full overflow-y-auto p-8 pb-40">
      <div className="max-w-5xl mx-auto">
      
      {/* En-tête */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-1">Home</h1>
          <p className="text-gray-500 text-sm">Accès rapide à vos derniers uploads et favoris.</p>
        </div>
        
        {/* ZONE UTILISATEUR : Connexion / Déconnexion */}
        <div>
          {user ? (
            <div className="flex items-center gap-4 relative">
              <div className="text-right hidden sm:block">
                <p className="text-white font-bold text-sm">{user.displayName || "Artiste"}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
              </div>
              
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className={`p-2 rounded-full text-white transition ${isUserMenuOpen ? 'bg-white/20' : 'bg-white/5 hover:bg-white/10'}`}
              >
                <MoreVertical size={20} />
              </button>

              {isUserMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsUserMenuOpen(false)}></div>
                  <div className="absolute right-0 top-12 w-48 bg-[#111] border border-[#333] rounded-xl shadow-2xl z-20 overflow-hidden py-1">
                    <Link 
                      href="/account"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors"
                    >
                      <User size={16} />
                      <span>Mon compte</span>
                    </Link>
                    <Link 
                      href="/subscription"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors"
                    >
                      <CreditCard size={16} />
                      <span>Abonnement</span>
                    </Link>
                    <Link 
                      href="/storage"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors"
                    >
                      <HardDrive size={16} />
                      <span>Stockage</span>
                    </Link>
                    <div className="h-px bg-[#222] my-1"></div>
                    <button 
                      onClick={() => { logout(); setIsUserMenuOpen(false); }}
                      className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                    >
                      <LogOut size={16} />
                      <span>Se déconnecter</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <button onClick={() => setIsAuthModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full font-bold text-sm hover:bg-gray-200 transition">
              <LogIn size={16} />
              <span>Connexion</span>
            </button>
          )}
        </div>
      </div>

      {/* ZONE D'UPLOAD (Les pointillés) */}
      <UploadZone />

      {/* SECTION FAVORIS (Si existants) */}
      {favorites.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4 px-1">
            <Heart size={18} className="text-red-500 fill-red-500" />
            <h2 className="text-lg font-bold text-white">Favoris</h2>
          </div>
          <TrackList tracks={favorites} />
        </div>
      )}

      {/* LISTE DES PISTES */}
      <div className="mb-4 px-1">
         <h2 className="text-lg font-bold text-white">Récents</h2>
      </div>
      <TrackList />

      {/* MODALE D'AUTHENTIFICATION */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      </div>
    </div>
  );
}