"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthContext";
import { UploadCloud, MoreVertical, User, CreditCard, LogOut, HardDrive } from "lucide-react";
import UploadZone from "@/components/library/UploadZone";
import { useAudio } from "@/components/audio/AudioContext";

export default function UploadPage() {
  const { uploadTrack } = useAudio();
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <main className="flex-1 overflow-y-auto pb-40">
      <div className="max-w-7xl mx-auto">
        <div className="sticky top-0 z-30 bg-black/90 backdrop-blur-xl px-8 py-8 flex items-center justify-between mb-8 border-b border-white/5">
          <div>
            <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
              <UploadCloud size={28} /> Uploader un son
            </h1>
            <p className="text-zinc-500">Ajoutez un nouveau morceau à votre bibliothèque.</p>
          </div>
          {user && (
            <div className="relative flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-bold text-white">{user.displayName}</div>
                <div className="text-xs text-zinc-400">{user.email}</div>
              </div>
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} 
                className={`p-2 rounded-full text-white transition ${isUserMenuOpen ? 'bg-white/20' : 'bg-white/5 hover:bg-white/10'}`}>
                <MoreVertical size={20} />
              </button>
              {isUserMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsUserMenuOpen(false)}></div>
                  <div className="absolute right-0 top-12 w-48 bg-[#111] border border-[#333] rounded-xl shadow-2xl z-20 overflow-hidden py-1">
                    <Link href="/account" onClick={() => setIsUserMenuOpen(false)} className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors"><User size={16} /> <span>Mon compte</span></Link>
                    <Link href="/subscription" onClick={() => setIsUserMenuOpen(false)} className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors"><CreditCard size={16} /> <span>Abonnement</span></Link>
                    <Link href="/storage" onClick={() => setIsUserMenuOpen(false)} className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors"><HardDrive size={16} /> <span>Stockage</span></Link>
                    <div className="h-px bg-[#222] my-1"></div>
                    <button onClick={() => { logout(); setIsUserMenuOpen(false); }} className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"><LogOut size={16} /> <span>Se déconnecter</span></button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="px-8">
          <div className="max-w-4xl mx-auto">
            <p className="text-zinc-400 mb-8 text-center">
              Les formats MP3, WAV, FLAC et AIFF sont supportés.
            </p>
            <UploadZone onFileSelect={uploadTrack} />
            <p className="text-center text-sm text-zinc-500 mt-4">
              Après l'upload, vous pourrez éditer les métadonnées comme le titre, l'artiste, le BPM et la clé depuis la page du morceau.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}