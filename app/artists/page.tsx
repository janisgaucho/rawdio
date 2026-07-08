"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAudio } from "@/components/audio/AudioContext";
import { useAuth } from "@/components/auth/AuthContext";
import { Music, MicVocal, MoreVertical, User, CreditCard, LogOut, HardDrive } from "lucide-react";

export default function ArtistsPage() {
  const { user, logout } = useAuth();
  const { playlist } = useAudio();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const artists = useMemo(() => {
    const artistMap = new Map<string, { name: string; coverUrl?: string | null; trackCount: number }>();

    playlist.forEach(track => {
      const contributors: string[] = [];

      // Ajouter l'interprète
      if (track.interprete && track.interprete !== "-") {
        contributors.push(track.interprete);
      }
      // Ajouter l'auteur
      if (track.auteur && track.auteur !== "-") {
        contributors.push(track.auteur);
      }
      // Ajouter les beatmakers (en les séparant s'il y en a plusieurs)
      if (track.beatmaker && track.beatmaker !== "-") {
        track.beatmaker.split(',').forEach(name => contributors.push(name.trim()));
      }

      // Mettre à jour la map pour chaque contributeur unique
      new Set(contributors).forEach(name => {
        if (artistMap.has(name)) {
          const existing = artistMap.get(name)!;
          artistMap.set(name, { 
            ...existing, 
            trackCount: existing.trackCount + 1 
          });
        } else {
          // On prend la pochette du premier morceau trouvé pour cet artiste
          artistMap.set(name, { name, coverUrl: track.coverUrl, trackCount: 1 });
        }
      });
    });

    // Convertir la map en tableau et trier par nom
    return Array.from(artistMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [playlist]);

  return (
    <main className="flex-1 overflow-y-auto pb-40">
      <div className="sticky top-0 z-30 bg-black/90 backdrop-blur-xl px-8 py-8 flex items-center justify-between mb-8 border-b border-white/5">
        <div>
          <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
            <MicVocal size={28} /> Artistes
          </h1>
          <p className="text-zinc-500">Parcourez tous les contributeurs de votre bibliothèque.</p>
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
      <div className="max-w-7xl mx-auto px-8">
        {artists.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
            {artists.map((artist) => (
              <Link href={`/artist/${encodeURIComponent(artist.name)}`} key={artist.name} className="group">
                <div className="relative aspect-square rounded-full overflow-hidden bg-[#111] border border-white/5 shadow-lg transition-all duration-300 ease-in-out group-hover:shadow-2xl group-hover:border-white/10 group-hover:scale-105">
                  {artist.coverUrl ? (
                    <Image src={artist.coverUrl} alt={artist.name} fill sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw" className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-[#1a1a1a] to-black">
                      <Music size={48} className="text-white/10" />
                    </div>
                  )}
                </div>
                <div className="mt-4 text-center">
                  <h3 className="font-bold text-white truncate">{artist.name}</h3>
                  <p className="text-sm text-zinc-400">{artist.trackCount} morceau{artist.trackCount > 1 ? 'x' : ''}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-zinc-500">
            Chargement des artistes...
          </div>
        )}
      </div>
    </main>
  );
}
