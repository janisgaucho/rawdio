"use client";

import { useState, useMemo } from "react";
import { useAudio } from "@/components/audio/AudioContext";
import TrackList from "./TrackList";
import { Search } from "lucide-react";

interface CategoryViewProps {
    title: string;
    type: 'artist' | 'beatmaker' | 'soundEngineer';
    icon: React.ElementType;
}

export default function CategoryView({ title, type, icon: Icon }: CategoryViewProps) {
    const { playlist } = useAudio();
    const [selectedItem, setSelectedItem] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    // Extraction des items uniques (Artistes, Beatmakers, etc.)
    const items = useMemo(() => {
        const allItems = new Set<string>();
        playlist.forEach(track => {
            // On utilise 'as any' car on accède dynamiquement aux propriétés
            const value = (track as any)[type];
            if (value && value !== "-") {
                // On sépare par virgule si plusieurs noms (ex: beatmakers)
                value.split(',').forEach((item: string) => allItems.add(item.trim()));
            }
        });
        return Array.from(allItems).sort();
    }, [playlist, type]);

    const filteredItems = items.filter(item => item.toLowerCase().includes(search.toLowerCase()));

    // Filtrage des pistes pour l'item sélectionné
    const filteredTracks = useMemo(() => {
        if (!selectedItem) return [];
        return playlist.filter(track => {
            const value = (track as any)[type];
            if (!value) return false;
            const parts = value.split(',').map((s: string) => s.trim());
            return parts.includes(selectedItem);
        });
    }, [playlist, selectedItem, type]);

    return (
        <div className="flex h-full w-full">
            {/* COLONNE DU MILIEU : Liste des items */}
            <div className="w-70 bg-[#050505] border-r border-[#222] flex flex-col shrink-0">
                <div className="p-6 border-b border-[#222]">
                    <div className="flex items-center gap-3 mb-4">
                        <Icon size={20} className="text-zinc-400" />
                        <h2 className="text-lg font-bold text-white">{title}</h2>
                    </div>
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-[#111] border border-[#333] rounded-lg py-2 pl-9 pr-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {filteredItems.map(item => (
                        <button
                            key={item}
                            onClick={() => setSelectedItem(item)}
                            className={`w-full text-left px-6 py-3 text-sm transition-all border-l-2 ${
                                selectedItem === item
                                    ? "bg-[#111] text-white border-white"
                                    : "text-zinc-400 hover:text-white hover:bg-[#111] border-transparent"
                            }`}
                        >
                            {item}
                        </button>
                    ))}
                    {filteredItems.length === 0 && (
                        <div className="p-6 text-xs text-zinc-600 text-center italic">
                            Aucun élément trouvé
                        </div>
                    )}
                </div>
            </div>

            {/* COLONNE DE DROITE : Contenu */}
            <div className="flex-1 overflow-y-auto bg-black p-8 pb-40">
                {selectedItem ? (
                    <div className="max-w-5xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-3xl font-black text-white tracking-tight mb-1">{selectedItem}</h1>
                            <p className="text-zinc-500 text-sm">{filteredTracks.length} morceau(x) trouvé(s)</p>
                        </div>
                        <TrackList tracks={filteredTracks} />
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-zinc-500">
                        <Icon size={48} className="mb-4 opacity-20" />
                        <p>Sélectionnez un {title.toLowerCase().slice(0, -1)} pour voir ses morceaux</p>
                    </div>
                )}
            </div>
        </div>
    );
}
