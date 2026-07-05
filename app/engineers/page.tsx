"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthContext";
import { useAudio } from "@/components/audio/AudioContext";
import { Sliders, MoreVertical, User, CreditCard, LogOut, HardDrive, Loader2 } from "lucide-react";

export default function EngineersPage() {
  const { user, logout } = useAuth();
  const { playlist } = useAudio();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

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
    <main className="flex-1 overflow-y-auto pb-40">
      <div className="max-w-7xl mx-auto">
        <div className="sticky top-0 z-30 bg-black/90 backdrop-blur-xl px-8 py-8 flex items-center justify-between mb-8 border-b border-white/5">
          <div>
            <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
              <Sliders size={28} /> Ingénieurs son
            </h1>
            <p className="text-zinc-500">Gérez et parcourez vos ingénieurs son.</p>
          </div>
          {user && (
            <div className="relative flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-bold text-white">{user.displayName}</div>
                <div className="text-xs text-zinc-400">{user.email}</div>
              </div>
              <button 
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} 
                className={`p-2 rounded-full text-white transition ${isUserMenuOpen ? 'bg-white/20' : 'bg-white/5 hover:bg-white/10'}`}>
                <MoreVertical size={20} />
              </button>
              {isUserMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsUserMenuOpen(false)}></div>
                  <div className="absolute right-0 top-12 w-48 bg-[#111] border border-[#333] rounded-xl shadow-2xl z-20 overflow-hidden py-1">
                    <Link href="/account" onClick={() => setIsUserMenuOpen(false)} className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors"><User size={16} /> <span>Mon compte</span></Link>
                    <Link href="/subscription" onClick={() => setIsUserMenuOpen(false)} className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors"><CreditCard size={16} /> <span>Abonnement</span></Link>
                    <Link href="/storage" onClick={() => setIsUserMenuOpen(false)} className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors"><HardDrive size={16} /> <span>Stockage</span></Link>
                    <div className="h-px bg-[#222] my-1"></div>
                    <button onClick={() => { logout(); setIsUserMenuOpen(false); }} className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"><LogOut size={16} /> <span>Se déconnecter</span></button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="px-8">
          {playlist.length > 0 ? (
            engineers.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {engineers.map((name) => (
                  <div key={name} className="group cursor-pointer bg-[#111] border border-white/10 rounded-xl p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center">
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
      </div>
    </main>
  );
}