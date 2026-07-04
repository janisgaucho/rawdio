"use client";

import { useState, useMemo } from "react";
import TrackList from "@/components/library/TrackList";
import { Library, Filter, Music, Tag, X, Activity } from "lucide-react";
import { useAudio, Track } from "@/components/audio/AudioContext";

export default function LibraryPage() {
  const { playlist } = useAudio();
  
  // États des filtres
  const [sortBy, setSortBy] = useState<string>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [minBpm, setMinBpm] = useState<string>('');
  const [maxBpm, setMaxBpm] = useState<string>('');

  // Extraction des données uniques pour les listes de filtres
  const availableGenres = useMemo(() => {
      const genres = new Set<string>();
      playlist.forEach(t => {
          if(t.genre && t.genre !== 'Autre' && t.genre !== '-') genres.add(t.genre);
      });
      return Array.from(genres).sort();
  }, [playlist]);

  const availableKeys = useMemo(() => {
      const keys = new Set<string>();
      playlist.forEach(t => {
          if(t.key && t.key !== '-') keys.add(t.key);
      });
      return Array.from(keys).sort();
  }, [playlist]);

  // Logique de Filtrage et Tri
  const filteredPlaylist = useMemo(() => {
      let result = [...playlist];

      // 1. Filtre : Genre
      if (selectedGenres.length > 0) {
          result = result.filter(t => t.genre && selectedGenres.includes(t.genre));
      }

      // 2. Filtre : Clé
      if (selectedKeys.length > 0) {
          result = result.filter(t => t.key && selectedKeys.includes(t.key));
      }

      // 3. Filtre : BPM
      if (minBpm) {
          result = result.filter(t => {
              const val = parseInt(t.bpm);
              return !isNaN(val) && val >= parseInt(minBpm);
          });
      }
      if (maxBpm) {
          result = result.filter(t => {
              const val = parseInt(t.bpm);
              return !isNaN(val) && val <= parseInt(maxBpm);
          });
      }

      // 4. Tri (Date, BPM, Durée)
      result.sort((a, b) => {
          let valA: any = 0;
          let valB: any = 0;

          if (sortBy === 'bpm') {
              valA = parseInt(a.bpm) || 0;
              valB = parseInt(b.bpm) || 0;
          } else if (sortBy === 'duration') {
              // Conversion "MM:SS" en secondes
              const toSeconds = (str: string) => {
                  if (!str || str === '-') return 0;
                  const parts = str.split(':');
                  return parseInt(parts[0]) * 60 + parseInt(parts[1]);
              };
              valA = toSeconds(a.duration);
              valB = toSeconds(b.duration);
          } else if (sortBy === 'date') {
             // Date : On utilise l'ordre naturel de la playlist (qui est déjà triée par date desc par défaut)
             return 0;
          } else {
             // Tri générique pour les autres colonnes
             valA = (a as any)[sortBy];
             valB = (b as any)[sortBy];

             if (typeof valA === 'string') valA = valA.toLowerCase();
             if (typeof valB === 'string') valB = valB.toLowerCase();
             
             if (!valA) valA = 0;
             if (!valB) valB = 0;
          }

          if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
          if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
          return 0;
      });
      
      // Cas spécial pour la Date (car la playlist est déjà triée par date DESC par défaut)
      // Si on veut ASC (plus vieux en premier), on inverse.
      if (sortBy === 'date' && sortOrder === 'asc') {
          result.reverse();
      }

      return result;
  }, [playlist, selectedGenres, selectedKeys, sortBy, sortOrder]);

  const toggleGenre = (g: string) => {
      setSelectedGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  };

  const toggleKey = (k: string) => {
      setSelectedKeys(prev => prev.includes(k) ? prev.filter(x => x !== k) : [...prev, k]);
  };

  const handleSort = (column: string) => {
      if (sortBy === column) {
          setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
      } else {
          setSortBy(column);
          setSortOrder('asc');
      }
  };

  const resetFilters = () => {
      setSelectedGenres([]);
      setSelectedKeys([]);
      setMinBpm('');
      setMaxBpm('');
      setSortBy('date');
      setSortOrder('desc');
  };

  return (
    <div className="flex h-full w-full">
        
        {/* COLONNE DU MILIEU : Filtres */}
        <div className="w-70 bg-[#050505] border-r border-[#222] flex flex-col shrink-0 overflow-y-auto">
            <div className="p-6 border-b border-[#222]">
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-3">
                        <Filter size={20} className="text-zinc-400" />
                        <h2 className="text-lg font-bold text-white">Filtres</h2>
                    </div>
                    {(selectedGenres.length > 0 || selectedKeys.length > 0 || minBpm || maxBpm || sortBy !== 'date' || sortOrder !== 'desc') && (
                        <button onClick={resetFilters} className="text-xs text-zinc-500 hover:text-white flex items-center gap-1">
                            <X size={12} /> RàZ
                        </button>
                    )}
                </div>
                <p className="text-xs text-zinc-500">Trier et filtrer la liste</p>
            </div>

            <div className="p-6 space-y-8">
                
                {/* GENRES */}
                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                        <Tag size={12} /> Genres
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {availableGenres.map(g => (
                            <button
                                key={g}
                                onClick={() => toggleGenre(g)}
                                className={`px-3 py-1 rounded-full text-xs border transition-colors ${selectedGenres.includes(g) ? 'bg-white text-black border-white font-bold' : 'bg-transparent text-zinc-400 border-[#333] hover:border-zinc-500'}`}
                            >
                                {g}
                            </button>
                        ))}
                        {availableGenres.length === 0 && <span className="text-xs text-zinc-600 italic">Aucun genre</span>}
                    </div>
                </div>

                {/* BPM */}
                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                        <Activity size={12} /> BPM
                    </h3>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            placeholder="Min"
                            value={minBpm}
                            onChange={(e) => setMinBpm(e.target.value)}
                            className="w-full bg-[#111] border border-[#333] rounded-lg py-2 px-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                        />
                        <span className="text-zinc-500">-</span>
                        <input
                            type="number"
                            placeholder="Max"
                            value={maxBpm}
                            onChange={(e) => setMaxBpm(e.target.value)}
                            className="w-full bg-[#111] border border-[#333] rounded-lg py-2 px-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                        />
                    </div>
                </div>

                {/* KEYS */}
                <div className="space-y-3">
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                        <Music size={12} /> Clé / Tonalité
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                        {availableKeys.map(k => (
                            <button
                                key={k}
                                onClick={() => toggleKey(k)}
                                className={`px-2 py-1 rounded-lg text-xs text-center border transition-colors ${selectedKeys.includes(k) ? 'bg-white text-black border-white font-bold' : 'bg-transparent text-zinc-400 border-[#333] hover:border-zinc-500'}`}
                            >
                                {k}
                            </button>
                        ))}
                        {availableKeys.length === 0 && <span className="col-span-3 text-xs text-zinc-600 italic">Aucune tonalité</span>}
                    </div>
                </div>

            </div>
        </div>

        {/* COLONNE DE DROITE : Contenu */}
        <div className="flex-1 overflow-y-auto bg-black p-8 pb-40">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-[#1a1a1a] rounded-xl border border-[#333]">
                        <Library size={24} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight mb-1">Bibliothèque</h1>
                        <p className="text-gray-500 text-sm">
                            {filteredPlaylist.length} fichier(s) 
                            {playlist.length !== filteredPlaylist.length && ` (sur ${playlist.length})`}
                        </p>
                    </div>
                </div>
                <TrackList 
                    tracks={filteredPlaylist} 
                    sortBy={sortBy} 
                    sortOrder={sortOrder} 
                    onSort={handleSort} 
                />
            </div>
        </div>
    </div>
  );
}
