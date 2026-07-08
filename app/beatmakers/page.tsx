"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthContext";
import { useAudio } from "@/components/audio/AudioContext";
import { Music2, Loader2 } from "lucide-react";

export default function BeatmakersPage() {
  const { user } = useAuth();
  const { playlist } = useAudio();

  // Crée une liste de beatmakers uniques
  const beatmakers = useMemo(() => {
    const beatmakerSet = new Set<string>();
    playlist.forEach(track => {
      if (track.beatmaker && track.beatmaker !== '-') {
        track.beatmaker.split(',').forEach(name => {
          const trimmedName = name.trim();
          if (trimmedName) beatmakerSet.add(trimmedName);
        });
      }
    });
    return Array.from(beatmakerSet).sort();
  }, [playlist]);

  return (
    <div className="max-w-7xl mx-auto">
          {playlist.length > 0 ? (
            beatmakers.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {beatmakers.map((name) => (
                  <div key={name} className="group cursor-pointer bg-[#111] border border-white/10 rounded-xl p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                      <Music2 size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white truncate">{name}</h3>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-zinc-500">Aucun beatmaker trouvé dans votre bibliothèque.</p>
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
                <p className="text-zinc-500">Connectez-vous pour voir vos beatmakers.</p>
              )}
            </div>
          )}
        </div>
  );
}