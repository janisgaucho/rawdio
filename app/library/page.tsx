"use client";

import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/components/auth/AuthContext";
import { useAudio } from "@/components/audio/AudioContext";
import { Loader2, Music, Play, Pause } from "lucide-react";

export default function LibraryPage() {
  const { user } = useAuth();
  const { playlist, playTrack, currentTrack, isPlaying } = useAudio();

  return (
    <div className="max-w-7xl mx-auto mt-8">
          {playlist.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
              {playlist.map((track) => {
                const isThisTrackPlaying = currentTrack?.id === track.id && isPlaying;

                const handlePlayClick = (e: React.MouseEvent) => {
                  e.preventDefault(); // Empêche la navigation du Link parent
                  e.stopPropagation();
                  playTrack(track);
                };

                return (
                  <Link href={`/track/${track.id}`} key={track.id} className="group cursor-pointer">
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#111] border border-white/5 shadow-lg transition-all duration-300 ease-in-out group-hover:shadow-2xl group-hover:border-white/10">
                      {track.coverUrl ? (
                        <Image src={track.coverUrl} alt={track.title} fill sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-[#1a1a1a] to-black">
                          <Music size={48} className="text-white/10" />
                        </div>
                      )}

                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px]">
                        <button
                          onClick={handlePlayClick}
                          className="w-16 h-16 bg-white/90 text-black rounded-full flex items-center justify-center transform transition-all duration-300 hover:scale-110 hover:bg-white active:scale-100 shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                          aria-label={isThisTrackPlaying ? "Mettre en pause" : "Lire"}
                        >
                          {isThisTrackPlaying ? 
                            <Pause size={24} fill="currentColor" /> : 
                            <Play size={24} fill="currentColor" className="ml-1" />}
                        </button>
                      </div>
                    </div>
                    <div className="mt-3">
                      <h3 className="font-bold text-white truncate">{track.title}</h3>
                      <p className="text-sm text-zinc-400 truncate">{track.interprete || track.beatmaker}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              {user ? (
                <>
                  <Loader2 className="mx-auto animate-spin text-zinc-500 mb-4" size={32} />
                  <p className="text-zinc-500">Chargement de votre bibliothèque...</p>
                </>
              ) : (
                <p className="text-zinc-500">Connectez-vous pour voir votre bibliothèque.</p>
              )}
            </div>
          )}
        </div>
  );
}