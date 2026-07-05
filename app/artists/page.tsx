"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/components/auth/AuthContext";
import { useAudio } from "@/components/audio/AudioContext";
import { Mic2, MoreVertical, User, CreditCard, LogOut, HardDrive, Loader2, Music } from "lucide-react";

export default function ArtistsPage() {
  const { user, logout } = useAuth();
  const { playlist } = useAudio();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Crée une liste d'artistes uniques avec une cover associée
  const artists = useMemo(() => {
    const artistMap = new Map<string, { name: string; coverUrl?: string | null }>();
    playlist.forEach(track => {
      if (track.artist && !artistMap.has(track.artist)) {
        artistMap.set(track.artist, { name: track.artist, coverUrl: track.coverUrl });
      }
    });
    return Array.from(artistMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [playlist]);

  return (
    <main className="flex-1 overflow-y-auto pb-40">
      <div className="max-w-7xl mx-auto">
        <div className="sticky top-0 z-30 bg-black/90 backdrop-blur-xl px-8 py-8 flex items-center justify-between mb-8 border-b border-white/5">
          <div>
            <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
              <Mic2 size={28} /> Artistes
            </h1>
            <p className="text-zinc-500">Gérez et parcourez vos artistes.</p>
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
          {playlist.length > 0 ? (
            artists.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                {artists.map((artist) => (
                  <div key={artist.name} className="group cursor-pointer">
                    <div className="aspect-square w-full bg-[#111] border border-white/10 rounded-full overflow-hidden relative transition-all group-hover:border-white/20 group-hover:scale-105">
                      {artist.coverUrl ? (
                        <Image src={artist.coverUrl} alt={artist.name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
                          <User size={48} className="text-zinc-600" />
                        </div>
                      )}
                    </div>
                    <div className="mt-3 text-center">
                      <h3 className="font-bold text-white truncate">{artist.name}</h3>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-zinc-500">Aucun artiste trouvé dans votre bibliothèque.</p>
              </div>
            )
          ) : (
            <div className="text-center py-20">
              {user ? (
                <>
                  <Loader2 className="mx-auto animate-spin text-zinc-500 mb-4" size={32} />
                  <p className="text-zinc-500">Analyse de votre bibliothèque...</p>
                </>
              ) : (
                <p className="text-zinc-500">Connectez-vous pour voir vos artistes.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}