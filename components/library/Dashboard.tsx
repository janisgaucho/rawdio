"use client";

import TrackList from "@/components/library/TrackList";
import UploadZone from "@/components/library/UploadZone";
import { Heart } from "lucide-react";
import { useAudio } from "@/components/audio/AudioContext";

export default function Dashboard() {
  const { playlist } = useAudio();
  const favorites = playlist.filter((track: any) => track.isFavorite);

  return (
    <div className="max-w-5xl mx-auto mt-8">
      <UploadZone />

      {favorites.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-4 px-1">
            <Heart size={18} className="text-red-500 fill-red-500" />
            <h2 className="text-lg font-bold text-white">Favoris</h2>
          </div>
          <TrackList tracks={favorites} />
        </div>
      )}

      <div className="mb-4 px-1">
         <h2 className="text-lg font-bold text-white">Récents</h2>
      </div>
      <TrackList tracks={playlist} />
    </div>
  );
}