"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Play, Music2, Trash2, MoreVertical, Edit2, Heart, ChevronUp, ChevronDown, ArrowUpDown } from "lucide-react";
import { useAudio } from "@/components/audio/AudioContext";

interface TrackListProps {
  tracks?: any[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (column: string) => void;
}

export default function TrackList({ tracks, sortBy, sortOrder, onSort }: TrackListProps) {
  const { playlist: allTracks, playTrack, deleteTrack, editTrack, toggleFavorite } = useAudio();
  const playlist = tracks || allTracks;
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const router = useRouter();

  const renderSortArrow = (column: string) => {
    if (sortBy === column) {
      return sortOrder === 'asc' ? <ChevronUp size={12} className="ml-1 text-white" /> : <ChevronDown size={12} className="ml-1 text-white" />;
    }
    return <ArrowUpDown size={12} className="ml-1 opacity-40" />;
  };

  if (playlist.length === 0) {
    return (
      <div className="text-center text-gray-500 py-10">
        Aucune piste trouvée. Upload ton premier son !
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* En-tête */}
      <div className="grid grid-cols-12 gap-4 px-4 py-2 border-b border-[#262626] text-xs font-medium text-gray-500">
        <div 
          className={`col-span-5 flex items-center ${onSort ? 'cursor-pointer hover:text-white' : ''}`}
          onClick={() => onSort && onSort('title')}
        >
          Titre {renderSortArrow('title')}
        </div>
        
        <div className="col-span-2 text-center flex justify-center gap-1">
            <span 
              onClick={() => onSort && onSort('bpm')} 
              className={`${onSort ? 'cursor-pointer hover:text-white' : ''} flex items-center`}
            >
              BPM {renderSortArrow('bpm')}
            </span>
            <span>/</span>
            <span 
              onClick={() => onSort && onSort('key')} 
              className={`${onSort ? 'cursor-pointer hover:text-white' : ''} flex items-center`}
            >
              Key {renderSortArrow('key')}
            </span>
        </div>

        <div 
          className={`col-span-2 text-right flex justify-end items-center ${onSort ? 'cursor-pointer hover:text-white' : ''}`} 
          onClick={() => onSort && onSort('duration')}
        >
          Durée {renderSortArrow('duration')}
        </div>
        <div 
          className={`col-span-2 text-right flex justify-end items-center ${onSort ? 'cursor-pointer hover:text-white' : ''}`} 
          onClick={() => onSort && onSort('date')}
        >
          Ajouté {renderSortArrow('date')}
        </div>
        <div className="col-span-1"></div>
      </div>

      <div className="mt-2">
        {playlist.map((track) => (
          <div 
            key={track.id} 
            onClick={() => router.push(`/track/${track.id}`)}
            className="group grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-[#1a1a1a] rounded-lg transition-colors cursor-pointer border border-transparent hover:border-[#262626]"
          >
            {/* Titre */}
            <div className="col-span-5 flex items-center gap-4">
              <div 
                onClick={(e) => { e.stopPropagation(); playTrack(track); }}
                className="relative w-8 h-8 flex items-center justify-center bg-[#1a1a1a] rounded overflow-hidden group-hover:bg-white group-hover:text-black transition-colors text-gray-400 hover:scale-110"
              >
                {track.coverUrl ? (
                  <>
                    <img 
                      src={track.coverUrl} 
                      alt={track.title} 
                      className="absolute inset-0 w-full h-full object-cover group-hover:hidden" 
                    />
                    <div className="absolute inset-0 p-0.5 flex flex-col justify-start items-start bg-linear-to-b from-black/60 to-transparent pointer-events-none group-hover:hidden">
                        <h1 className="text-white text-[4px] font-bold leading-none line-clamp-1">{track.title}</h1>
                        <p className="text-white/90 text-[3px] font-light leading-none truncate w-full">{track.artist}</p>
                    </div>
                  </>
                ) : (
                  <Music2 size={16} className="group-hover:hidden" />
                )}
                <Play size={16} fill="black" className="hidden group-hover:block ml-0.5 z-10" />
              </div>
              <div className="overflow-hidden">
                <div className="text-sm font-medium text-white group-hover:text-white truncate">
                  {track.title}
                </div>
                <div className="text-xs text-gray-500">{track.artist}</div>
              </div>
            </div>
            
            {/* Infos : Affichage brut sans modification */}
            <div className="col-span-2 text-center text-xs text-gray-500 font-mono">
                {track.bpm} | {track.key}
            </div>

            <div className="col-span-2 text-right text-xs text-gray-500 font-mono">
                {track.duration}
            </div>
             <div className="col-span-2 text-right text-xs text-gray-500">
                {track.date}
            </div>

            {/* Actions */}
            <div className="col-span-1 flex justify-end items-center gap-2 relative">
                {/* Menu 3 points */}
                <button 
                    onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenId(menuOpenId === track.id ? null : track.id);
                    }}
                    className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-full transition opacity-0 group-hover:opacity-100"
                >
                    <MoreVertical size={18} />
                </button>

                {/* Dropdown Menu */}
                {menuOpenId === track.id && (
                    <>
                        {/* Overlay invisible pour fermer le menu au clic ailleurs */}
                        <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setMenuOpenId(null); }} />
                        
                        <div className="absolute right-0 top-8 w-56 bg-[#222] border border-[#333] rounded-xl shadow-2xl z-20 overflow-hidden py-1">
                            <button 
                                onClick={(e) => { e.stopPropagation(); toggleFavorite(track); setMenuOpenId(null); }}
                                className="w-full text-left px-4 py-3 text-sm text-white hover:bg-[#333] flex items-center gap-3 transition-colors"
                            >
                                <Heart size={14} className={track.isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"} /> 
                                {track.isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); editTrack(track); setMenuOpenId(null); }}
                                className="w-full text-left px-4 py-3 text-sm text-white hover:bg-[#333] flex items-center gap-3 transition-colors"
                            >
                                <Edit2 size={14} className="text-gray-400" /> Éditer les informations
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); deleteTrack(track.id, track.url); setMenuOpenId(null); }}
                                className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-3 transition-colors border-t border-[#333]"
                            >
                                <Trash2 size={14} /> Supprimer
                            </button>
                        </div>
                    </>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}