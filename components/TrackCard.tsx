"use client";

import { Play, Pause, Music } from "lucide-react";
import { useAudio, Track } from "@/components/audio/AudioContext";

interface TrackCardProps {
  track: Track;
}

export default function TrackCard({ track }: TrackCardProps) {
  const { playTrack, currentTrack, isPlaying } = useAudio();

  // Détermine si le morceau de CETTE carte est celui qui est en cours de lecture
  const isThisTrackPlaying = currentTrack?.id === track.id && isPlaying;

  // Gère le clic sur le bouton play/pause
  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Empêche d'autres actions (comme la navigation)
    playTrack(track); // Utilise le contexte global pour jouer le morceau
  };

  return (
    <div className="relative group aspect-square rounded-2xl overflow-hidden bg-[#111] border border-white/5 shadow-lg transition-all duration-300 ease-in-out hover:shadow-2xl hover:border-white/10">
      
      {/* Image de la pochette ou placeholder */}
      {track.coverUrl ? (
        <img
          src={track.coverUrl}
          alt={track.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-[#1a1a1a] to-black">
          <Music size={48} className="text-white/10" />
        </div>
      )}

      {/* Informations du morceau (toujours visible en bas) */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
        <h3 className="font-bold text-white truncate">{track.title}</h3>
        <p className="text-sm text-white/70 truncate">{track.artist}</p>
      </div>

      {/* Lecteur qui apparaît au survol */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px]">
        <button
          onClick={handlePlayClick}
          className="
            w-16 h-16 bg-white/90 text-black rounded-full 
            flex items-center justify-center
            transform transition-all duration-300 
            hover:scale-110 hover:bg-white
            active:scale-100
            shadow-[0_0_30px_rgba(255,255,255,0.3)]
          "
          aria-label={isThisTrackPlaying ? "Mettre en pause" : "Lire"}
        >
          {isThisTrackPlaying ? 
            <Pause size={24} fill="currentColor" /> : 
            <Play size={24} fill="currentColor" className="ml-1" />}
        </button>
      </div>
    </div>
  );
}