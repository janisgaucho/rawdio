"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthContext";
import { User, Mail, Calendar, Shield, Clock, Loader2, Save, MoreVertical, CreditCard, HardDrive, LogOut } from "lucide-react";

export default function AccountPage() {
  const { user, loading, updateUsername, logout } = useAuth();
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  const [pseudo, setPseudo] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Redirection si non connecté
  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  // Reset de l'erreur si l'utilisateur change
  useEffect(() => {
    setImageError(false);
  }, [user?.photoURL]);

  // Initialiser le pseudo quand l'user est chargé
  useEffect(() => {
    if (user?.displayName) setPseudo(user.displayName);
  }, [user]);

  const handleSavePseudo = async () => {
    if (!user || !pseudo.trim()) return;
    setIsSaving(true);
    try {
      await updateUsername(pseudo);
    } catch (error) {
      console.error("Erreur mise à jour pseudo:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full w-full flex items-center justify-center text-white/50">
        <Loader2 size={32} className="animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* COLONNE GAUCHE : PROFIL CARD */}
          <div className="col-span-1 lg:col-span-4">
            <div className="bg-[#111] border border-[#222] rounded-3xl p-8 flex flex-col items-center text-center">
                <div className="w-32 h-32 bg-[#222] rounded-full flex items-center justify-center text-white/20 border border-[#333] overflow-hidden mb-6 shadow-2xl">
                  {user.photoURL && !imageError ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.displayName || "Avatar"} 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <User size={48} />
                  )}
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-1">{user.displayName || "Utilisateur"}</h2>
                <p className="text-zinc-500 text-sm mb-8">{user.email}</p>

                <div className="w-full border-t border-[#222] pt-6 space-y-4">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-500 flex items-center gap-2"><Calendar size={14} /> Membre depuis</span>
                        <span className="text-white font-medium">{user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString("fr-FR") : "-"}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-500 flex items-center gap-2"><Clock size={14} /> Dernière connexion</span>
                        <span className="text-white font-medium">{user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleDateString("fr-FR") : "-"}</span>
                    </div>
                </div>
            </div>
          </div>

          {/* COLONNE DROITE : FORMULAIRES */}
          <div className="col-span-1 lg:col-span-8 space-y-6">
            
            <div className="bg-[#111] border border-[#222] rounded-3xl p-8">
                <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                    <User size={20} className="text-zinc-500" /> Informations personnelles
                </h3>

                <div className="space-y-8">
                    {/* CHAMP PSEUDONYME */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-widest">
                        Pseudonyme
                      </label>
                      <div className="flex gap-3">
                        <input 
                          type="text" 
                          value={pseudo} 
                          onChange={(e) => setPseudo(e.target.value)}
                          className="flex-1 bg-black/20 border border-[#333] rounded-xl py-3 px-4 text-white focus:bg-white/5 focus:border-white/20 focus:outline-none transition-all"
                          placeholder="Votre nom d'artiste"
                        />
                        <button 
                          onClick={handleSavePseudo}
                          disabled={isSaving || pseudo === user.displayName}
                          className="px-6 bg-white text-black rounded-xl font-bold hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                        >
                          {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                          <span className="hidden sm:inline">Enregistrer</span>
                        </button>
                      </div>
                      <p className="text-xs text-zinc-600">Ce nom sera affiché sur vos morceaux et votre profil public.</p>
                    </div>

                    {/* EMAIL */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-white/40 uppercase tracking-widest">
                        Adresse Email
                      </label>
                      <div className="w-full bg-black/20 border border-[#333] rounded-xl py-3 px-4 text-zinc-400 cursor-not-allowed">
                        {user.email}
                      </div>
                    </div>
                </div>
            </div>

            <div className="bg-[#111] border border-[#222] rounded-3xl p-8">
                <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-3">
                    <Shield size={20} className="text-zinc-500" /> Sécurité & Avancé
                </h3>
                
                <div className="space-y-3">
                  <label className="text-xs font-bold text-white/40 uppercase tracking-widest">
                    Identifiant Utilisateur (UID)
                  </label>
                  <div className="w-full bg-black/20 border border-[#333] rounded-xl py-3 px-4 text-zinc-500 font-mono text-xs break-all">
                    {user.uid}
                  </div>
                  <p className="text-xs text-zinc-600">Identifiant unique utilisé par le système.</p>
                </div>
            </div>

          </div>

        </div>
    </div>
  );
}
