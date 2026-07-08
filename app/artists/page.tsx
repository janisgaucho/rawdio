"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAudio } from "@/components/audio/AudioContext";
import { useAuth } from "@/components/auth/AuthContext";
import { Music } from "lucide-react";

export default function ArtistsPage() {
  const { user } = useAuth();
  const { playlist } = useAudio();

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
    <div className="max-w-7xl mx-auto">
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
  );
}
