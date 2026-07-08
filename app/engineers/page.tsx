"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthContext";
import { useAudio } from "@/components/audio/AudioContext";
import { Sliders, Loader2 } from "lucide-react";

export default function EngineersPage() {
  const { user } = useAuth();
  const { playlist } = useAudio();

  // Crée une liste d'ingénieurs son uniques
  const engineers = useMemo(() => {
    const engineerSet = new Set<string>();
    playlist.forEach(track => {
      if (track.soundEngineer && track.soundEngineer !== '-') {
        track.soundEngineer.split(',').forEach(name => {
          const trimmedName = name.trim();
          if (trimmedName) engineerSet.add(trimmedName);
        });
      }
    });
    return Array.from(engineerSet).sort();
  }, [playlist]);

  return (
    <div className="max-w-7xl mx-auto">
          {playlist.length > 0 ? (
            engineers.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {engineers.map((name) => (
                  <div key={name} className="group cursor-pointer bg-[#111] border border-white/10 rounded-xl p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
                      <Sliders size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white truncate">{name}</h3>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-zinc-500">Aucun ingénieur son trouvé dans votre bibliothèque.</p>
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
                <p className="text-zinc-500">Connectez-vous pour voir vos ingénieurs son.</p>
              )}
            </div>
          )}
        </div>
  );
}