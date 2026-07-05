"use client";

import { useState, useEffect } from "react";
import Link from 'next/link';
import { useAudio } from "@/components/audio/AudioContext";
import { useAuth } from "@/components/auth/AuthContext";
import { HardDrive, FileAudio, MoreVertical, User, CreditCard, LogOut, Image as ImageIcon, Trash2, Loader2, Eye, Play, X, Music2, Home, Music } from 'lucide-react';
import { UploadButton } from "@/UploadButton"; // Assurez-vous que le chemin est correct
import { listFiles, deleteFile as deleteFileAction } from "@/app/actions/storage";
import { getPlanLimit, PLANS, PlanType } from "@/lib/plans";

// Helper pour extraire la clé (le chemin) depuis une URL R2
const getStoragePathFromUrl = (url: string) => {
    if (!url) return null;
    try {
        const urlObj = new URL(url);
        // La clé est simplement le chemin, sans le slash initial
        return urlObj.pathname.substring(1);
    } catch (e) {
        console.warn("URL invalide pour extraction du chemin:", url);
        return null;
    }
};

export default function StoragePage() {
  const { playlist, sharedPlaylist, userPlan } = useAudio();
  const { user, logout } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [previewFile, setPreviewFile] = useState<any | null>(null);

  // Récupérer TOUS les fichiers physiques du Storage
  useEffect(() => {
    if (!user) return;

    let isMounted = true;
    setLoading(true);
    setFiles([]);
    setError(null);

    const fetchFiles = async () => {
      try {
        const r2Files = await listFiles();
        if (isMounted) {
          setFiles(r2Files);
        }
      } catch (e) {
        if (isMounted) {
          console.error("Erreur R2 storage:", e);
          setError("Impossible de charger la liste des fichiers depuis R2.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchFiles();

    return () => {
        isMounted = false;
    };
  }, [user, refreshKey]);
  
  // --- OPTIMISATION ---
  // 1. Créer un Set de tous les chemins de fichiers utilisés (playlist + partagés) pour une recherche rapide (O(1))
  const allTracks = [...playlist, ...sharedPlaylist];
  const usedPaths = new Set<string>();
  const pathToTrackMap = new Map<string, any>();

  allTracks.forEach(track => {
    if (track.url) {
      const path = getStoragePathFromUrl(track.url);
      if (path) {
        usedPaths.add(path);
        pathToTrackMap.set(path, { track, versionLabel: '' });
      }
    }
    if (track.coverUrl) {
      const path = getStoragePathFromUrl(track.coverUrl);
      if (path) {
        usedPaths.add(path);
        pathToTrackMap.set(path, { track, versionLabel: '' });
      }
    }
    track.versions?.forEach(version => {
      if (version.url) {
        const path = getStoragePathFromUrl(version.url);
        if (path) {
          usedPaths.add(path);
          pathToTrackMap.set(path, { track, versionLabel: ` (${version.name})` });
        }
      }
    });
  });

  // 2. Traiter les fichiers en utilisant le Set pour vérifier leur statut
  const processedFiles = files.map(file => {
      const isUsed = usedPaths.has(file.fullPath);
      const associatedData = pathToTrackMap.get(file.fullPath);
      return {
          ...file,
          isUsed,
          isOrphan: !isUsed,
          associatedTitle: associatedData ? `${associatedData.track.title}${associatedData.versionLabel}` : (file.name.replace(/\.[^/.]+$/, "")),
          associatedArtist: associatedData ? associatedData.track.artist : ""
      };
  });
  
  // Tri : Orphelins en premier, puis par date
  processedFiles.sort((a, b) => {
      if (a.isUsed === b.isUsed) {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return a.isUsed ? 1 : -1;
  });

  const totalUsed = processedFiles.reduce((acc, file) => acc + (file.size || 0), 0);
  const maxStorage = getPlanLimit(userPlan);
  const usagePercent = Math.min(100, (totalUsed / maxStorage) * 100);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "Ko", "Mo", "Go", "To"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatType = (mime?: string, name?: string) => {
    if (!mime) return "MP3";
    if (mime.startsWith("image/")) {
        if (name && name.includes('.')) {
            return name.split('.').pop()?.toUpperCase() || "IMG";
        }
        return mime.split('/')[1]?.toUpperCase() || "IMG";
    }
    if (mime.includes("wav")) return "WAV";
    if (mime.includes("mpeg") || mime.includes("mp3")) return "MP3";
    if (mime.includes("aiff")) return "AIFF";
    if (mime.includes("flac")) return "FLAC";
    if (mime.includes("ogg")) return "OGG";
    if (mime.includes("m4a") || mime.includes("mp4")) return "M4A";
    return "AUDIO";
  };

  const handleDeleteFile = async (file: any) => {
      if (file.isUsed) {
          alert("Ce fichier est actuellement utilisé par un morceau. Supprimez le morceau ou changez sa version avant de supprimer le fichier.");
          return;
      }
      if (!confirm("Supprimer définitivement ce fichier inutilisé ?")) return;

      try {
          await deleteFileAction(file.url);
          setFiles(prev => prev.filter(f => f.id !== file.id)); // Mise à jour optimiste
      } catch (e) {
          console.error("Erreur suppression:", e);
          alert("Erreur lors de la suppression.");
      }
  };

  // Récupération du nom d'affichage du plan (ex: "free" -> "Free")
  const currentPlanName = PLANS[userPlan as PlanType]?.name || "Free";

  return (
    <div className="flex h-screen w-full bg-black">
      {/* EXEMPLE DE SIDEBAR */}
      <aside className="w-64 shrink-0 bg-[#0a0a0a] border-r border-white/10 p-6 flex flex-col">
        <div className="text-2xl font-bold text-white mb-10">RAWDIO</div>
        <nav className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-3 text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                <Home size={20} />
                <span>Accueil</span>
            </Link>
            <Link href="/storage" className="flex items-center gap-3 text-sm font-medium text-white bg-white/10 p-2 rounded-lg">
                <HardDrive size={20} />
                <span>Stockage</span>
            </Link>
            {/* Voici le bouton corrigé. Il remplace le <Link href="/upload"> */}
            <UploadButton />
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto pb-40">
        <div className="max-w-7xl mx-auto">
          
          <div className="sticky top-0 z-30 bg-black/90 backdrop-blur-xl px-8 py-8 flex items-center justify-between mb-8 border-b border-white/5">
              <div>
                  <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
                      <HardDrive size={28} /> Stockage
                  </h1>
                  <p className="text-zinc-500">Gérez votre espace de stockage et vos fichiers.</p>
              </div>
              
              {/* Menu Utilisateur */}
              {user && (
                  <div className="relative flex items-center gap-4">
                      <div className="text-right">
                          <div className="text-sm font-bold text-white">{user.displayName}</div>
                          <div className="text-xs text-zinc-400">{user.email}</div>
                      </div>
                      <button 
                          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                          className={`p-2 rounded-full text-white transition ${isUserMenuOpen ? 'bg-white/20' : 'bg-white/5 hover:bg-white/10'}`}
                      >
                          <MoreVertical size={20} />
                      </button>

                      {isUserMenuOpen && (
                          <>
                              <div className="fixed inset-0 z-10" onClick={() => setIsUserMenuOpen(false)}></div>
                              <div className="absolute right-0 top-12 w-48 bg-[#111] border border-[#333] rounded-xl shadow-2xl z-20 overflow-hidden py-1">
                                  <Link href="/account" onClick={() => setIsUserMenuOpen(false)} className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors">
                                      <User size={16} /> <span>Mon compte</span>
                                  </Link>
                                  <Link href="/subscription" onClick={() => setIsUserMenuOpen(false)} className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors">
                                      <CreditCard size={16} /> <span>Abonnement</span>
                                  </Link>
                                  <Link href="/storage" onClick={() => setIsUserMenuOpen(false)} className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-colors">
                                      <HardDrive size={16} /> <span>Stockage</span>
                                  </Link>
                                  <div className="h-px bg-[#222] my-1"></div>
                                  <button onClick={() => { logout(); setIsUserMenuOpen(false); }} className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors">
                                      <LogOut size={16} /> <span>Se déconnecter</span>
                                  </button>
                              </div>
                          </> 
                      )}
                  </div>
              )}
          </div>

          <div className="px-8">

          {/* BARRE DE PROGRESSION */}
          <div className="bg-[#111] border border-[#222] rounded-2xl p-6 mb-8">
              <div className="flex justify-between items-end mb-2">
                  <div>
                      <span className="text-2xl font-bold text-white">{formatSize(totalUsed)}</span>
                      <span className="text-zinc-500 text-sm ml-2">utilisés sur {formatSize(maxStorage)}</span>
                  </div>
                  <div className="text-right">
                      <span className="text-white font-bold">{usagePercent.toFixed(1)}%</span>
                  </div>
              </div>
              <div className="w-full bg-[#333] rounded-full h-4 overflow-hidden">
                  <div 
                      className={`h-full rounded-full transition-all duration-500 ${usagePercent > 90 ? 'bg-red-500' : 'bg-white'}`} 
                      style={{ width: `${usagePercent}%` }}
                  />
              </div>
              <p className="text-xs text-zinc-500 mt-3">
                  Offre actuelle : <span className="text-white font-medium">{currentPlanName} ({formatSize(maxStorage)})</span>. 
                  <a href="/subscription" className="ml-1 underline hover:text-white">Augmenter mon stockage</a>
              </p>
          </div>

          {/* LISTE DES FICHIERS */}
          <div className="bg-[#111] border border-[#222] rounded-2xl overflow-hidden">
              <table className="w-full text-left text-sm text-zinc-400">
                  <thead className="bg-[#1a1a1a] text-xs uppercase font-bold text-zinc-500">
                      <tr>
                          <th className="px-6 py-4">Fichier / Morceau</th>
                          <th className="px-6 py-4 text-center">Type</th>
                          <th className="px-6 py-4 text-right">Taille</th>
                          <th className="px-6 py-4 text-right">Date</th>
                          <th className="px-6 py-4 text-right">Action</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-[#222]">
                      {error && (
                          <tr>
                              <td colSpan={5} className="px-6 py-8 text-center text-red-400">
                                  {error}
                              </td>
                          </tr>
                      )}
                      {loading ? (
                          <tr>
                              <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                                  <div className="flex flex-col items-center gap-2">
                                      <Loader2 size={24} className="animate-spin" />
                                      <span>Analyse du stockage...</span>
                                  </div>
                              </td>
                          </tr>
                      ) : processedFiles.map((file) => (
                          <tr key={file.id} className="hover:bg-[#1a1a1a] transition-colors">
                              <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                      <div className={`rounded text-zinc-300 flex items-center justify-center ${file.category === 'image' ? 'w-10 h-10 overflow-hidden bg-black border border-white/10' : 'p-2 bg-[#222]'}`}>
                                          {file.category === 'image' && !file.error && file.url.startsWith('http') ? (
                                              <img src={file.url} alt="Cover" className="w-full h-full object-cover" />
                                          ) : (
                                              file.category === 'image'
                                                  ? <ImageIcon size={16} /> 
                                                  : <FileAudio size={16} />
                                          )}
                                      </div>
                                      <div>
                                          <div className={`font-medium flex items-center gap-2 ${file.isOrphan ? 'text-orange-400' : 'text-white'}`}>
                                              {file.associatedTitle}
                                              {file.isOrphan && (
                                                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-400 bg-orange-400/10 px-2 py-0.5 rounded border border-orange-400/20">
                                                      ORPHELIN
                                                  </span>
                                              )}
                                          </div>
                                          <div className="text-xs">{file.associatedArtist}</div>
                                      </div>
                                  </div>
                              </td>
                              <td className="px-6 py-4 text-center">
                                  {file.error ? (
                                      <span className="text-[10px] font-bold bg-red-500/20 text-red-400 px-2 py-1 rounded border border-red-500/30">ERREUR</span>
                                  ) : (
                                      <span className="text-[10px] font-bold bg-[#333] text-zinc-300 px-2 py-1 rounded border border-[#444]">{formatType(file.type, file.name)}</span>
                                  )}
                              </td>
                              <td className="px-6 py-4 text-right font-mono text-white">{formatSize(file.size)}</td>
                              <td className="px-6 py-4 text-right text-xs">{new Date(file.date).toLocaleDateString()}</td>
                              <td className="px-6 py-4 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                      <button 
                                          onClick={() => setPreviewFile(file)}
                                          disabled={!!file.error}
                                          className="p-2 text-zinc-500 hover:text-white hover:bg-white/10 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                          title="Prévisualiser"
                                      >
                                          {file.category === 'image' ? <Eye size={16} /> : <Play size={16} />}
                                      </button>
                                      <button 
                                          onClick={() => handleDeleteFile(file)} 
                                          disabled={file.isUsed}
                                          className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed" 
                                          title={file.isUsed ? "Ce fichier est utilisé et ne peut pas être supprimé." : "Supprimer ce fichier"}>
                                          <Trash2 size={16} />
                                      </button>
                                  </div>
                              </td>
                          </tr>
                      ))}
                      {!loading && processedFiles.length === 0 && (
                          <tr>
                              <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">
                                  Aucun fichier trouvé.
                              </td>
                          </tr>
                      )}
                  </tbody>
              </table>
          </div>

          {/* MODALE DE PREVIEW */}
          {previewFile && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setPreviewFile(null)}>
                  <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-3xl relative flex flex-col items-center shadow-2xl" onClick={e => e.stopPropagation()}>
                      <button 
                          onClick={() => setPreviewFile(null)}
                          className="absolute top-4 right-4 p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                      >
                          <X size={24} />
                      </button>

                      <h3 className="text-lg font-bold text-white mb-6 text-center w-full truncate px-8">{previewFile.name}</h3>

                      {previewFile.category === 'image' ? (
                          <div className="relative w-full h-[50vh] flex items-center justify-center bg-black/50 rounded-xl overflow-hidden border border-white/5">
                                  <img src={previewFile.url} alt={previewFile.name} className="w-full h-full object-contain" />
                          </div>
                      ) : (
                          <div className="w-full py-8 flex flex-col items-center gap-8">
                              <div className="w-32 h-32 bg-[#222] rounded-full flex items-center justify-center text-white/20 shadow-inner">
                                  <Music2 size={64} />
                              </div>
                              <audio controls autoPlay src={previewFile.url} className="w-full" />
                          </div>
                      )}
                      
                      <div className="mt-6 flex gap-4 text-sm text-zinc-500 font-mono">
                          <span>{formatType(previewFile.type, previewFile.name)}</span>
                          <span>•</span>
                          <span>{formatSize(previewFile.size)}</span>
                      </div>
                  </div>
              </div>
          )}

          </div>
          </div>
        </main>
    </div>
  );
}
