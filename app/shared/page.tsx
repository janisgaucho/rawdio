"use client";

import React, { useEffect, useState } from "react";
import { useAudio } from "@/components/audio/AudioContext";
import { Play, Pause, Calendar, User } from "lucide-react";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Composant pour récupérer et afficher les infos du propriétaire
const OwnerInfo = ({ userId }: { userId?: string }) => {
  const [owner, setOwner] = useState<{ displayName: string; photoURL: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
        setLoading(false);
        return;
    }
    
    const fetchOwner = async () => {
        setLoading(true);
        try {
            const userDoc = await getDoc(doc(db, "users", userId));
            if (userDoc.exists()) {
                const data = userDoc.data();
                setOwner(data as any);
            }
        } catch (error) {
            console.error(`[OwnerInfo] Erreur technique:`, error);
        } finally {
            setLoading(false);
        }
    };
    
    fetchOwner();
  }, [userId]);

  if (!userId) return <span className="text-xs italic text-zinc-500">Non renseigné</span>;
  if (loading) return <span className="text-xs italic text-zinc-500">Chargement...</span>;
  if (!owner) return <span className="text-xs text-red-400 font-medium" title={`ID: ${userId}`}>Introuvable (ID invalide)</span>;

  return (
    <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-zinc-800 overflow-hidden shrink-0">
            {owner.photoURL ? (
                <img src={owner.photoURL} alt={owner.displayName} className="w-full h-full object-cover" />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-500">
                    <User size={12} />
                </div>
            )}
        </div>
        <span className="text-xs text-zinc-300 truncate max-w-[150px]">{owner.displayName}</span>
    </div>
  );
};

export default function SharedPage() {
  const { sharedPlaylist, currentTrack, playTrack } = useAudio();

  return (
    <div className="flex-1 h-full overflow-y-auto bg-[#0a0a0a] p-8">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Partagés avec vous</h1>
          <p className="text-zinc-400 text-sm">
            Retrouvez ici tous les morceaux que d'autres utilisateurs ont partagés avec votre adresse email.
          </p>
        </div>
        <div className="text-zinc-500 text-xs font-mono">
          {sharedPlaylist.length} morceau{sharedPlaylist.length > 1 ? "x" : ""}
        </div>
      </header>

      <div className="w-full overflow-hidden rounded-xl border border-[#222] bg-[#111]/50">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#1a1a1a] text-zinc-400 text-xs uppercase tracking-wider font-medium">
            <tr>
              <th className="px-6 py-4 w-12">#</th>
              <th className="px-6 py-4">Titre</th>
              <th className="px-6 py-4">Artiste</th>
              <th className="px-6 py-4">Ajouté le</th>
              <th className="px-6 py-4">Partagé par</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#222]">
            {sharedPlaylist.length > 0 ? (
              sharedPlaylist.map((track, index) => {
                const isPlaying = currentTrack?.id === track.id;
                
                return (
                  <tr 
                    key={track.id} 
                    className="group hover:bg-[#1a1a1a] transition-colors duration-200"
                  >
                    {/* Colonne Lecture */}
                    <td className="px-6 py-4 text-center relative">
                      <span className="text-zinc-600 font-mono text-xs group-hover:opacity-0 transition-opacity">
                        {index + 1}
                      </span>
                      <button 
                        onClick={() => playTrack(track)}
                        className="absolute inset-0 m-auto w-8 h-8 flex items-center justify-center rounded-full bg-white text-black opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg"
                      >
                        {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" className="ml-0.5" />}
                      </button>
                    </td>

                    {/* Colonne Titre */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <Link href={`/track/${track.id}`} className="text-white font-medium hover:underline truncate max-w-50">
                          {track.title}
                        </Link>
                        <span className="text-xs text-zinc-500 md:hidden">{track.artist}</span>
                      </div>
                    </td>

                    {/* Colonne Artiste */}
                    <td className="px-6 py-4 text-zinc-300">
                      {track.artist}
                    </td>

                    {/* Colonne Date */}
                    <td className="px-6 py-4 text-zinc-400">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-zinc-600" />
                        <span>{track.date}</span>
                      </div>
                    </td>

                    {/* Colonne Partagé par */}
                    <td className="px-6 py-4 text-zinc-400">
                      <OwnerInfo userId={track.userId} />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-zinc-500 italic">
                  Aucun morceau n'a été partagé avec vous pour le moment.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
