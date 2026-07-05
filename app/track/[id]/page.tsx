"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAudio, Track, TrackVersion } from "@/components/audio/AudioContext";
import { ArrowLeft, Play, Pause, Calendar, Music, Disc, Mic2, Sliders, Activity, MoreVertical, Edit2, Trash2, History, Upload, Loader2, MessageSquare, Send, Check, X, AlignLeft, Clock, User, Share2, Wand2, ChevronDown, FileAudio, HardDrive, Sparkles } from "lucide-react";
import { doc, onSnapshot, updateDoc, collection, query, where, getDocs, limit, getDoc, setDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { getAuth, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { db } from "@/lib/firebase";
import { generateCoverArt } from "@/components/audio/generateCover";
import { uploadFile, deleteFile } from "@/app/actions/storage";
import { detectBpmFromFile } from "@/lib/audioAnalysis";

const GENRES = ["Hip-Hop", "Trap", "Drill", "R&B", "Pop", "Afro", "Electro", "House", "Techno", "Rock", "Jazz", "Soul", "Reggae", "Dancehall", "Zouk", "Variété", "Alternative", "Autre"];
const KEYS_MAJOR = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
const KEYS_MINOR = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'G#', 'A', 'Bb', 'B'];

export default function TrackPage() {
  const { id } = useParams();
  const router = useRouter();
  const { playTrack, currentTrack, deleteTrack, uploadVersion, isUploading, restoreVersion } = useAudio();
  const [track, setTrack] = useState<Track | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedVersionId, setExpandedVersionId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");
  const [newCommentTimestamp, setNewCommentTimestamp] = useState("");
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editedCommentText, setEditedCommentText] = useState("");
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isDetectingBpm, setIsDetectingBpm] = useState(false);
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
  const [owner, setOwner] = useState<any>(null);
  
  // Refs pour la recherche (Debounce & Race conditions)
  const searchTimeout = useRef<any>(null);
  const lastSearchTerm = useRef("");

  // États pour l'édition inline
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Track>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) return;

    if (!isAuthReady) return;

    if (!user) {
        setTrack(null);
        setLoading(false);
        return;
    }

    const docRef = doc(db, "tracks", id as string);
    const unsubscribe = onSnapshot(docRef, 
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          console.log("[TrackPage] Données Firestore reçues:", data);
          // Formatage de la date
          let dateDisplay = "Date inconnue";
          if (data.createdAt?.seconds) {
             const dateObj = new Date(data.createdAt.seconds * 1000);
             dateDisplay = dateObj.toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', year: 'numeric' });
          }
          setTrack({ id: docSnap.id, ...data, date: dateDisplay } as Track);
          setEditData({ id: docSnap.id, ...data } as Track);
        } else {
            setTrack(null);
        }
        setLoading(false);
    }, (error) => {
        // Gère les erreurs, notamment les problèmes de permissions après une déconnexion.
        console.error("Erreur d'accès aux données:", error);
        setTrack(null);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [id, user, isAuthReady]);

  useEffect(() => {
    if (track?.userId) {
        console.log("[TrackPage] Fetching owner for ID:", track.userId);
        getDoc(doc(db, "users", track.userId)).then(snap => {
            if (snap.exists()) {
                const ownerData = snap.data();
                setOwner(ownerData);
            } else {
                console.error(`[TrackPage] Utilisateur introuvable pour l'ID: ${track.userId}`);
            }
        }).catch(error => {
            console.error("Erreur récupération owner:", error);
        });
    } else if (track) {
        console.log("[TrackPage] Pas de userId sur ce track:", track);
    }
  }, [track]);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
        setUser(u);
        setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-screen text-white/50 animate-pulse">Chargement des données...</div>;
  if (!track) return <div className="flex items-center justify-center h-screen text-white/50">Morceau introuvable</div>;

  const handleDelete = async () => {
    if (track) {
      await deleteTrack(track.id, track.url);
      router.push('/');
    }
  };

  const handleVersionUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && track) {
        uploadVersion(track, e.target.files[0]);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && track) {
        const file = e.target.files[0];
        setIsGeneratingCover(true); // On réutilise le même état de chargement
        try {
            const formData = new FormData();
            formData.append("file", file);
            const downloadURL = await uploadFile(formData, "covers");
            
            // Suppression de l'ancienne cover si elle existe
            if (track.coverUrl) {
                await deleteFile(track.coverUrl).catch(error => 
                    console.warn("Impossible de supprimer l'ancienne cover:", error)
                );
            }

            await updateDoc(doc(db, "tracks", track.id), {
                coverUrl: downloadURL
            });
        } catch (error) {
            console.error("Erreur upload cover:", error);
            alert("Erreur lors de l'upload de la cover");
        } finally {
            setIsGeneratingCover(false);
        }
    }
  };

  const handleGenerateAiCover = async () => {
    if (!track) return;
    setIsGeneratingCover(true);
    try {
        // On utilise les données d'édition si disponibles, sinon celles du track
        const result = await generateCoverArt({
            title: editData.title || track.title,
            artist: editData.artist || track.artist,
            genre: editData.genre || track.genre || "Abstract",
            bpm: editData.bpm || track.bpm || "120"
        } as any);

        if (result.success && result.imageBase64) {
            const base64String = `data:image/png;base64,${result.imageBase64}`;
            
            // Convertir Base64 en File pour l'upload Firebase
            const res = await fetch(base64String);
            const blob = await res.blob();
            const file = new File([blob], "cover_ai_generated.png", { type: "image/png" });
            
            // Upload via Server Action
            const formData = new FormData();
            formData.append("file", file);
            const downloadURL = await uploadFile(formData, "covers");
            
            // Suppression de l'ancienne cover si elle existe pour éviter les orphelins
            if (track.coverUrl) {
                await deleteFile(track.coverUrl).catch(error => {
                    console.warn("Impossible de supprimer l'ancienne cover (peut-être déjà supprimée ou externe):", error);
                });
            }

            // Mise à jour Firestore
            await updateDoc(doc(db, "tracks", track.id), {
                coverUrl: downloadURL
            });
        } else {
            alert("Erreur IA : " + result.error);
        }
    } catch (e) {
        console.error(e);
        alert("Erreur lors de la génération");
    } finally {
        setIsGeneratingCover(false);
    }
  };

  const playVersion = (version: TrackVersion) => {
      // On crée un objet Track temporaire pour jouer cette version spécifique
      const versionTrack: Track = {
          ...track,
          url: version.url,
          duration: version.duration,
          title: `${track.title} (${version.name})`, // Affiche "Titre (v1.0)" dans le player
          bpm: version.bpm || track.bpm,
          key: version.key || track.key
      };
      playTrack(versionTrack);
  };

  const handlePostComment = async (versionId: string) => {
    if (!newComment.trim() || !track || !user) return;

    const commentData = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        text: newComment,
        timestamp: newCommentTimestamp,
        author: user.displayName || "Utilisateur",
        uid: user.uid,
        authorPhotoUrl: user.photoURL || null,
        createdAt: new Date().toLocaleDateString("fr-FR", { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    };

    const updatedVersions = (track.versions || []).map(v => {
        if (v.id === versionId) {
            return {
                ...v,
                comments: [...(v.comments || []), commentData]
            };
        }
        return v;
    });

    try {
        await updateDoc(doc(db, "tracks", track.id), {
            versions: updatedVersions
        });
        setNewComment("");
        setNewCommentTimestamp("");
    } catch (error) {
        console.error("Erreur ajout commentaire:", error);
    }
  };

  const handleDeleteComment = async (versionId: string, commentId: string) => {
    if (!track) return;
    
    const updatedVersions = (track.versions || []).map(v => {
        if (v.id === versionId) {
            return {
                ...v,
                comments: v.comments?.filter((c: any) => c.id !== commentId) || []
            };
        }
        return v;
    });

    try {
        await updateDoc(doc(db, "tracks", track.id), {
            versions: updatedVersions
        });
    } catch (error) {
        console.error("Erreur suppression commentaire:", error);
    }
  };

  const handleEditComment = async (versionId: string, commentId: string) => {
    if (!track || !editedCommentText.trim()) return;

    const updatedVersions = (track.versions || []).map(v => {
        if (v.id === versionId) {
            return {
                ...v,
                comments: v.comments?.map((c: any) => {
                    if (c.id === commentId) {
                        return { ...c, text: editedCommentText };
                    }
                    return c;
                }) || []
            };
        }
        return v;
    });

    try {
        await updateDoc(doc(db, "tracks", track.id), {
            versions: updatedVersions
        });
        setEditingCommentId(null);
        setEditedCommentText("");
    } catch (error) {
        console.error("Erreur édition commentaire:", error);
    }
  };

  const handleSearchUsers = (term: string) => {
      setShareEmail(term);
      setSelectedUser(null);
      lastSearchTerm.current = term;
      
      // Annuler la recherche précédente si elle n'a pas encore eu lieu
      if (searchTimeout.current) {
          clearTimeout(searchTimeout.current);
      }
      
      if (term.length === 0) {
          setSearchResults([]);
          setIsSearching(false);
          return;
      }

      setIsSearching(true);

      // Délai de 300ms avant de lancer la requête (Debounce)
      searchTimeout.current = setTimeout(async () => {
        try {
          const usersRef = collection(db, "users");
          const cleanTerm = term.trim(); // On nettoie les espaces
          const lowerTerm = cleanTerm.toLowerCase();
          const capTerm = cleanTerm.charAt(0).toUpperCase() + cleanTerm.slice(1);
          const upperTerm = cleanTerm.toUpperCase();
          
          console.log("Recherche Firestore pour :", cleanTerm);

          // On simplifie la recherche pour éviter les erreurs et les doublons
          const queries = [
              // Recherche standard (Email et DisplayName)
              query(usersRef, where('email', '>=', cleanTerm), where('email', '<=', cleanTerm + '\uf8ff'), limit(5)),
              query(usersRef, where('displayName', '>=', cleanTerm), where('displayName', '<=', cleanTerm + '\uf8ff'), limit(5))
          ];

          // On utilise map + catch pour qu'une requête échouée (ex: index manquant) ne fasse pas planter toute la recherche
          const snapshots = await Promise.all(queries.map(q => getDocs(q).catch(e => {
              console.warn("Une requête de recherche a échoué (ignorée):", e);
              return { forEach: () => {} }; // Retourne un objet vide compatible pour éviter le crash
          })));
          
          // Si le terme a changé entre temps, on ignore ce résultat
          if (lastSearchTerm.current !== term) return;

          const usersMap = new Map();
          
          snapshots.forEach(snap => {
              (snap as any).forEach((doc: any) => {
                  const data = doc.data();
                  // On autorise l'affichage de soi-même pour les tests
                  if (data.email) {
                      usersMap.set(doc.id, { id: doc.id, ...data });
                  }
              });
          });
          
          const results = Array.from(usersMap.values());
          console.log("Utilisateurs trouvés :", results);
          setSearchResults(results);
        } catch (error) {
          console.error("Erreur recherche utilisateurs:", error);
        } finally {
          if (lastSearchTerm.current === term) {
              setIsSearching(false);
          }
        }
      }, 300);
  };

  const handleShare = async () => {
    if (!track || !shareEmail.trim()) return;
    
    const emailToAdd = shareEmail.trim().toLowerCase();

    // Si l'utilisateur n'a pas été sélectionné via la liste, on vérifie s'il existe en base
    if (!selectedUser) {
        try {
            const usersRef = collection(db, "users");
            // On vérifie l'email exact ET l'email en minuscules (pour gérer la casse)
            const q1 = query(usersRef, where("email", "==", emailToAdd));
            const q2 = query(usersRef, where("emailLower", "==", emailToAdd.toLowerCase()));
            
            const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)]);
            
            if (snap1.empty && snap2.empty) {
                alert("Utilisateur introuvable. Veuillez sélectionner un utilisateur dans la liste ou vérifier l'adresse email.");
                return;
            }
        } catch (error) {
            console.error("Erreur vérification utilisateur:", error);
            return;
        }
    }

    try {
        // Utilisation de arrayUnion pour ajouter sans doublon et créer le tableau si nécessaire
        await updateDoc(doc(db, "tracks", track.id), {
            sharedWith: arrayUnion(emailToAdd)
        });
        setShareEmail("");
        setSelectedUser(null);
        setSearchResults([]);
    } catch (error) {
        console.error("Erreur lors du partage:", error);
        alert("Erreur lors du partage");
    }
  };

  const handleRemoveShare = async (emailToRemove: string) => {
      if (!track) return;
      try {
          // Utilisation de arrayRemove pour retirer l'élément proprement
          await updateDoc(doc(db, "tracks", track.id), {
              sharedWith: arrayRemove(emailToRemove)
          });
      } catch (error) {
          console.error("Erreur lors de la suppression du partage:", error);
      }
  };

  const handleSave = async () => {
    if (!track) return;
    try {
        // On ne met à jour que les champs modifiables
        await updateDoc(doc(db, "tracks", track.id), {
            title: editData.title,
            artist: editData.artist,
            bpm: editData.bpm,
            key: editData.key,
            type: editData.type,
            genre: editData.genre,
            beatmaker: editData.beatmaker,
            soundEngineer: editData.soundEngineer,
            lyrics: editData.lyrics || ""
        });
        setIsEditing(false);
    } catch (error) {
        console.error("Erreur sauvegarde:", error);
        alert("Erreur lors de la sauvegarde");
    }
  };

  const handleChange = (field: keyof Track, value: string) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  // Helper pour décomposer la clé (ex: "Cm" -> note: "C", mode: "m")
  const getKeyDetails = (keyStr?: string) => {
    const match = keyStr?.match(/^([A-G][#b]?)(m|M)$/);
    return match ? { note: match[1], mode: match[2] } : { note: '', mode: '' };
  };

  const isPlaying = currentTrack?.id === track.id;

  const handleAutoDetectBpm = async () => {
    if (!track?.url) return;
    
    setIsDetectingBpm(true);
    try {
        // On récupère le fichier depuis l'URL
        const response = await fetch(track.url);
        const blob = await response.blob();
        const file = new File([blob], "temp.mp3", { type: blob.type });
        
        const detectedBpm = await detectBpmFromFile(file);
        
        if (detectedBpm) {
            if (isEditing) {
                handleChange("bpm", detectedBpm);
            } else {
                await updateDoc(doc(db, "tracks", track.id), {
                    bpm: detectedBpm
                });
            }
        } else {
            console.warn("BPM detection returned null. Check audio file volume or complexity.");
            alert("BPM non détecté. Le fichier est peut-être trop silencieux ou le rythme trop complexe.");
        }
    } catch (error: any) {
        console.error("Erreur détection BPM:", error);
        if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
            alert("Erreur d'accès au fichier audio. Vérifiez la configuration CORS de votre stockage (R2).");
        } else {
            alert("Erreur lors de la détection du BPM.");
        }
    } finally {
        setIsDetectingBpm(false);
    }
  };

  // Fonction pour réparer les anciens fichiers sans propriétaire
  const handleClaimTrack = async () => {
    if (!track || !user) return;
    if (confirm("Voulez-vous vous définir comme propriétaire de ce morceau ?")) {
        try {
            await updateDoc(doc(db, "tracks", track.id), {
                userId: user.uid
            });
        } catch (error) {
            console.error("Erreur claim:", error);
            alert("Erreur lors de l'attribution.");
        }
    }
  };

  return (
    <div className="h-full w-full overflow-y-auto p-8 pb-40 text-white">
        {/* Header */}
        <div className="flex justify-between items-center mb-12 max-w-7xl mx-auto">
            {/* Retour */}
            <button 
                onClick={() => router.back()} 
                className="group flex items-center gap-2 text-white/50 hover:text-white transition-colors"
            >
                <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                    <ArrowLeft size={16} />
                </div>
                <span className="text-sm font-medium">Retour à la bibliothèque</span>
            </button>

            {/* Menu */}
            <div className="relative flex items-center gap-2">
                {isEditing ? (
                    <>
                        <button 
                            onClick={() => { setIsEditing(false); setEditData(track); }}
                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
                            title="Annuler"
                        >
                            <X size={20} />
                        </button>
                        <button 
                            onClick={handleSave}
                            className="p-2 text-green-400 hover:bg-green-500/10 rounded-full transition-colors"
                            title="Enregistrer"
                        >
                            <Check size={20} />
                        </button>
                    </>
                ) : (
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                    >
                        <MoreVertical size={20} />
                    </button>
                )}

                {isMenuOpen && track && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setIsMenuOpen(false); }} />
                        <div className="absolute right-0 top-full mt-2 w-56 bg-[#222] border border-[#333] rounded-xl shadow-2xl z-20 overflow-hidden py-1">
                            <button 
                                onClick={(e) => { e.stopPropagation(); setIsEditing(true); setIsMenuOpen(false); }}
                                className="w-full text-left px-4 py-3 text-sm text-white hover:bg-[#333] flex items-center gap-3 transition-colors"
                            >
                                <Edit2 size={14} className="text-gray-400" /> Éditer les informations
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); setIsShareModalOpen(true); setIsMenuOpen(false); }}
                                className="w-full text-left px-4 py-3 text-sm text-white hover:bg-[#333] flex items-center gap-3 transition-colors"
                            >
                                <Share2 size={14} className="text-gray-400" /> Collaborateurs
                            </button>
                            <button 
                                onClick={handleDelete}
                                className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-3 transition-colors border-t border-[#333]"
                            >
                                <Trash2 size={14} /> Supprimer le morceau
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>

        {/* Contenu Principal */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-7xl mx-auto">
            
            {/* Colonne Gauche : Visuel & Actions */}
            <div className="col-span-1 lg:col-span-4 space-y-8">
                {/* "Pochette" générée dynamiquement */}
                <div className={`aspect-square w-full rounded-3xl border border-white/10 flex items-center justify-center shadow-2xl relative group overflow-hidden ${!track.coverUrl ? 'bg-linear-to-br from-[#1a1a1a] to-black' : 'bg-black'}`}>
                    
                    {track.coverUrl ? (
                        <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                    ) : (
                        <>
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                            <Music size={80} className="text-white/10 group-hover:text-white/20 transition-colors duration-500" />
                        </>
                    )}

                    {/* TEXTE OVERLAY (Style Apple Music) - Toujours visible */}
                    {track.coverUrl && (
                        <div className="absolute inset-0 p-6 flex flex-col justify-start items-start bg-linear-to-b from-black/60 to-transparent pointer-events-none z-10">
                            <h1 className="text-white text-3xl font-bold tracking-tight leading-tight drop-shadow-md font-sans line-clamp-2">
                                {track.title}
                            </h1>
                            <p className="text-white/90 text-lg font-light mt-1 tracking-wide drop-shadow-sm font-sans truncate w-full">
                                {track.artist}
                            </p>
                        </div>
                    )}

                    {/* Overlay Play / Upload */}
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px] z-20">
                        {isEditing ? (
                            <div className="flex gap-4">
                                <button 
                                    onClick={() => coverInputRef.current?.click()}
                                    className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all border border-white/20"
                                    title="Uploader une image"
                                >
                                    <Upload size={24} />
                                </button>
                                <button 
                                    onClick={handleGenerateAiCover}
                                    disabled={isGeneratingCover}
                                    className="w-16 h-16 bg-purple-500/40 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-purple-500/60 transition-all border border-white/20"
                                    title="Générer avec l'IA"
                                >
                                    {isGeneratingCover ? <Loader2 size={24} className="animate-spin" /> : <Sparkles size={24} />}
                                </button>
                            </div>
                        ) : (
                            <button 
                                onClick={() => playTrack(track)}
                                className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                            >
                                {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-2" />}
                            </button>
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    {isEditing ? (
                        <input 
                            type="text" 
                            value={editData.title || ""} 
                            onChange={(e) => handleChange("title", e.target.value)}
                            className="w-full bg-transparent border-b border-white/20 text-4xl md:text-5xl font-bold tracking-tight leading-tight focus:outline-none focus:border-white transition-colors pb-1"
                        />
                    ) : (
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">{track.title}</h1>
                    )}
                    {isEditing ? (
                        <input 
                            type="text" 
                            value={editData.artist || ""} 
                            onChange={(e) => handleChange("artist", e.target.value)}
                            className="w-full bg-transparent border-b border-white/20 text-xl md:text-2xl text-white/60 font-light focus:outline-none focus:border-white transition-colors pb-1"
                        />
                    ) : (
                        <p className="text-xl md:text-2xl text-white/60 font-light">{track.artist}</p>
                    )}
                </div>
            </div>

            {/* Colonne Droite : Détails */}
            <div className="col-span-1 lg:col-span-8 space-y-8">
                
                {/* Grille de Stats Rapides */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-[#111] border border-white/5 rounded-2xl p-5 flex flex-col gap-2 hover:bg-[#161616] transition-colors">
                        <span className="text-xs text-white/40 uppercase tracking-widest font-bold flex items-center gap-2">
                            <Activity size={12} /> BPM
                        </span>
                        {isEditing ? (
                            <div className="relative">
                                <input 
                                    type="text" 
                                    value={editData.bpm || ""} 
                                    onChange={(e) => handleChange("bpm", e.target.value.replace(/[^0-9]/g, ''))}
                                    className="bg-transparent w-full text-3xl font-mono font-light focus:outline-none border-b border-white/10 focus:border-white"
                                />
                                {(!editData.bpm || editData.bpm === "-") && (
                                    <button 
                                        onClick={handleAutoDetectBpm}
                                        disabled={isDetectingBpm}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                        title="Détecter automatiquement"
                                    >
                                        {isDetectingBpm ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <span className="text-3xl font-mono font-light">{track.bpm || "-"}</span>
                                {(!track.bpm || track.bpm === "-" || track.bpm === "") && (
                                    <button 
                                        onClick={handleAutoDetectBpm}
                                        disabled={isDetectingBpm}
                                        className="p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                        title="Détecter automatiquement"
                                    >
                                        {isDetectingBpm ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="bg-[#111] border border-white/5 rounded-2xl p-5 flex flex-col gap-2 hover:bg-[#161616] transition-colors">
                        <span className="text-xs text-white/40 uppercase tracking-widest font-bold flex items-center gap-2">
                            <Music size={12} /> Clé
                        </span>
                        {isEditing ? (
                            <div className="flex flex-col gap-2 w-full">
                                <div className="flex gap-1">
                                    <button 
                                        onClick={() => handleChange("key", `${getKeyDetails(editData.key).note || 'C'}M`)}
                                        className={`flex-1 py-1 text-[10px] font-bold rounded border transition-colors ${getKeyDetails(editData.key).mode === 'M' ? 'bg-white text-black border-white' : 'bg-transparent text-white/40 border-white/10 hover:border-white/30'}`}
                                    >
                                        MAJ
                                    </button>
                                    <button 
                                        onClick={() => handleChange("key", `${getKeyDetails(editData.key).note || 'C'}m`)}
                                        className={`flex-1 py-1 text-[10px] font-bold rounded border transition-colors ${getKeyDetails(editData.key).mode === 'm' ? 'bg-white text-black border-white' : 'bg-transparent text-white/40 border-white/10 hover:border-white/30'}`}
                                    >
                                        MIN
                                    </button>
                                </div>
                                <select 
                                    value={getKeyDetails(editData.key).note}
                                    onChange={(e) => handleChange("key", `${e.target.value}${getKeyDetails(editData.key).mode || 'M'}`)}
                                    className="bg-transparent w-full text-xl font-mono font-light focus:outline-none border-b border-white/10 focus:border-white appearance-none py-0 cursor-pointer"
                                >
                                    <option value="" className="bg-[#222]">Note</option>
                                    {(getKeyDetails(editData.key).mode === 'm' ? KEYS_MINOR : KEYS_MAJOR).map(k => (
                                        <option key={k} value={k} className="bg-[#222]">{k}</option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <span className="text-3xl font-mono font-light">{track.key}</span>
                        )}
                    </div>
                    <div className="bg-[#111] border border-white/5 rounded-2xl p-5 flex flex-col gap-2 hover:bg-[#161616] transition-colors">
                        <span className="text-xs text-white/40 uppercase tracking-widest font-bold flex items-center gap-2">
                            <Disc size={12} /> Type
                        </span>
                        {isEditing ? (
                            <div className="flex gap-1 w-full mt-1">
                                <button 
                                    onClick={() => handleChange("type", "prod")}
                                    className={`flex-1 py-2 text-xs font-bold rounded border transition-colors ${editData.type === 'prod' ? 'bg-white text-black border-white' : 'bg-transparent text-white/40 border-white/10 hover:border-white/30'}`}
                                >
                                    Prod
                                </button>
                                <button 
                                    onClick={() => handleChange("type", "morceau")}
                                    className={`flex-1 py-2 text-xs font-bold rounded border transition-colors ${editData.type === 'morceau' ? 'bg-white text-black border-white' : 'bg-transparent text-white/40 border-white/10 hover:border-white/30'}`}
                                >
                                    Morceau
                                </button>
                            </div>
                        ) : (
                            <span className="text-xl capitalize truncate">{track.type || "N/A"}</span>
                        )}
                    </div>
                    <div className="bg-[#111] border border-white/5 rounded-2xl p-5 flex flex-col gap-2 hover:bg-[#161616] transition-colors">
                        <span className="text-xs text-white/40 uppercase tracking-widest font-bold flex items-center gap-2">
                            <Calendar size={12} /> Ajouté le
                        </span>
                        <span className="text-lg truncate">{track.date}</span>
                    </div>
                </div>

                {/* Liste des Crédits & Infos */}
                <div className="bg-[#111] border border-white/5 rounded-3xl p-8 space-y-8">
                    <h3 className="text-lg font-medium text-white/80 flex items-center gap-2">
                        Informations & Crédits
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-white/40 text-xs uppercase tracking-widest font-bold">
                                <Disc size={14} /> Genre
                            </div>
                            {isEditing ? (
                                <div className="relative w-full">
                                    <select 
                                        value={editData.genre || ""} 
                                        onChange={(e) => handleChange("genre", e.target.value)}
                                        className="w-full bg-transparent border-b border-white/10 text-xl font-light focus:outline-none focus:border-white transition-colors appearance-none py-1 pr-8 cursor-pointer"
                                    >
                                        <option value="" className="bg-[#222]">Sélectionner...</option>
                                        {GENRES.map(g => (
                                            <option key={g} value={g} className="bg-[#222]">{g}</option>
                                        ))}
                                    </select>
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-xl font-light">{track.genre || "Non spécifié"}</div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-white/40 text-xs uppercase tracking-widest font-bold">
                                <Mic2 size={14} /> Beatmaker(s)
                            </div>
                            {isEditing ? (
                                <input 
                                    type="text" 
                                    value={editData.beatmaker || ""} 
                                    onChange={(e) => handleChange("beatmaker", e.target.value)}
                                    className="w-full bg-transparent border-b border-white/10 text-xl font-light focus:outline-none focus:border-white transition-colors"
                                />
                            ) : (
                                <div className="text-xl font-light">{track.beatmaker || "-"}</div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-white/40 text-xs uppercase tracking-widest font-bold">
                                <Sliders size={14} /> Ingénieur son
                            </div>
                            {isEditing ? (
                                <input 
                                    type="text" 
                                    value={editData.soundEngineer || ""} 
                                    onChange={(e) => handleChange("soundEngineer", e.target.value)}
                                    className="w-full bg-transparent border-b border-white/10 text-xl font-light focus:outline-none focus:border-white transition-colors"
                                />
                            ) : (
                                <div className="text-xl font-light">{track.soundEngineer || "-"}</div>
                            )}
                        </div>
                        
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-white/40 text-xs uppercase tracking-widest font-bold">
                                <Activity size={14} /> Durée
                            </div>
                            <div className="text-xl font-light font-mono">{track.duration}</div>
                        </div>
                    </div>
                </div>

                 {/* Historique des Versions */}
                 <div className="bg-[#111] border border-white/5 rounded-3xl p-8 space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-white/80 flex items-center gap-2">
                            <History size={20} /> Historique des versions
                        </h3>
                        <button 
                            onClick={() => !isUploading && fileInputRef.current?.click()}
                            disabled={isUploading}
                            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-full text-xs font-bold transition-colors disabled:opacity-50"
                        >
                            {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                            {isUploading ? "Envoi..." : "Ajouter une version"}
                        </button>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="audio/*" 
                            onChange={handleVersionUpload}
                        />
                        <input 
                            type="file" 
                            ref={coverInputRef} 
                            className="hidden" 
                            accept="image/*" 
                            onChange={handleCoverUpload}
                        />
                    </div>

                    <div className="space-y-2">
                        {track.versions && track.versions.length > 0 ? (
                            track.versions.slice().reverse().map((version) => (
                                <div key={version.id} className="bg-white/5 rounded-xl border border-transparent hover:border-white/5 transition overflow-hidden">
                                    <div className="flex items-center justify-between p-4">
                                        <div className="flex items-center gap-4">
                                            <button 
                                                onClick={() => playVersion(version)}
                                                className="w-8 h-8 flex items-center justify-center bg-white/10 rounded-full hover:bg-white hover:text-black transition-colors"
                                            >
                                                <Play size={12} fill="currentColor" className="ml-0.5" />
                                            </button>
                                            <div>
                                                <div className="font-bold text-sm text-white flex items-center gap-2">
                                                    {version.name}
                                                    {version.url === track.url ? (
                                                        <span className="text-[10px] bg-white text-black px-1.5 py-0.5 rounded font-bold uppercase">Actuelle</span>
                                                    ) : (
                                                        <button 
                                                            onClick={() => restoreVersion(track, version)}
                                                            className="text-[10px] bg-white/10 hover:bg-white/20 text-white/60 hover:text-white px-2 py-0.5 rounded font-medium uppercase transition-colors"
                                                        >
                                                            Définir comme actuelle
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <button 
                                                onClick={() => setExpandedVersionId(expandedVersionId === version.id ? null : version.id)}
                                                className={`p-2 rounded-full transition-all duration-200 ${expandedVersionId === version.id ? 'bg-white text-black rotate-180' : 'text-white/40 hover:text-white hover:bg-white/10'}`}
                                            >
                                                <ChevronDown size={20} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Section Détails & Commentaires */}
                                    {expandedVersionId === version.id && (
                                        <div className="px-4 pb-4 pt-0 space-y-4">
                                            <div className="h-px w-full bg-white/5 mb-4"></div>
                                            
                                            {/* Informations Version */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 bg-white/5 p-4 rounded-xl mb-6">
                                                <div className="space-y-1">
                                                    <div className="text-[10px] uppercase text-white/40 font-bold tracking-wider flex items-center gap-1.5"><Calendar size={10} /> Date d'ajout</div>
                                                    <div className="text-sm font-medium text-white/90">{version.createdAt}</div>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="text-[10px] uppercase text-white/40 font-bold tracking-wider flex items-center gap-1.5"><Activity size={10} /> Débit</div>
                                                    <div className="text-sm font-medium text-white/90">{version.bitrate ? `${version.bitrate} kbps` : "-"}</div>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="text-[10px] uppercase text-white/40 font-bold tracking-wider flex items-center gap-1.5"><Activity size={10} /> Échant.</div>
                                                    <div className="text-sm font-medium text-white/90">{version.sampleRate ? `${version.sampleRate} Hz` : "-"}</div>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="text-[10px] uppercase text-white/40 font-bold tracking-wider flex items-center gap-1.5"><User size={10} /> Ajouté par</div>
                                                    <div className="flex items-center gap-2">
                                                        {(version.authorPhotoUrl || owner?.photoURL) ? (
                                                            <img src={version.authorPhotoUrl || owner?.photoURL} className="w-4 h-4 rounded-full object-cover" alt={version.authorName || owner?.displayName} />
                                                        ) : (
                                                            <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center"><User size={8} /></div>
                                                        )}
                                                        <div className="text-sm font-medium text-white/90 truncate">{version.authorName || owner?.displayName || "Inconnu"}</div>
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="text-[10px] uppercase text-white/40 font-bold tracking-wider flex items-center gap-1.5"><Clock size={10} /> Durée</div>
                                                    <div className="text-sm font-medium text-white/90 font-mono">{version.duration}</div>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="text-[10px] uppercase text-white/40 font-bold tracking-wider flex items-center gap-1.5"><FileAudio size={10} /> Type</div>
                                                    <div className="text-sm font-medium text-white/90 uppercase">
                                                        {(() => {
                                                            const mime = version.fileType || "";
                                                            // 1. Priorité au type MIME si disponible
                                                            if (mime.includes("wav")) return "WAV";
                                                            if (mime.includes("mpeg") || mime.includes("mp3")) return "MP3";
                                                            if (mime.includes("aiff") || mime.includes("x-aiff")) return "AIFF";
                                                            if (mime.includes("flac")) return "FLAC";
                                                            if (mime.includes("ogg")) return "OGG";
                                                            if (mime.includes("m4a") || mime.includes("mp4") || mime.includes("x-m4a")) return "M4A";
                                                            
                                                            // 2. Fallback sur l'extension de l'URL (pour les anciens fichiers ou types inconnus)
                                                            try {
                                                                const urlPath = version.url?.split('?')[0] || "";
                                                                const ext = urlPath.split('.').pop()?.toLowerCase();
                                                                if (ext === "mp3") return "MP3";
                                                                if (ext === "wav") return "WAV";
                                                                if (ext === "aif" || ext === "aiff") return "AIFF";
                                                                if (ext === "flac") return "FLAC";
                                                                if (ext === "m4a") return "M4A";
                                                                if (ext === "ogg") return "OGG";
                                                            } catch (e) {}

                                                            return mime ? mime.replace('audio/', '').toUpperCase() : "AUDIO";
                                                        })()}
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="text-[10px] uppercase text-white/40 font-bold tracking-wider flex items-center gap-1.5"><HardDrive size={10} /> Poids</div>
                                                    <div className="text-sm font-medium text-white/90">
                                                        {version.size ? (version.size / (1024 * 1024)).toFixed(2) + ' Mo' : (expandedVersionId === version.id ? "..." : "-")}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-xs font-bold text-white/40 uppercase tracking-widest">
                                                {version.comments?.length || 0} Commentaire{(version.comments?.length || 0) > 1 ? 's' : ''}
                                            </div>

                                            {/* Liste des commentaires */}
                                            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                                {version.comments && version.comments.length > 0 ? (
                                                    version.comments.map((comment: any) => {
                                                        // Vérification robuste de l'auteur (supporte uid ou userId)
                                                        const isAuthor = user && ((comment.uid && comment.uid === user.uid) || (comment.userId && comment.userId === user.uid));
                                                        
                                                        return (
                                                        <div key={comment.id} className="text-sm group">
                                                            <div className="flex items-start gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden shrink-0">
                                                                    {comment.authorPhotoUrl ? (
                                                                        <img src={comment.authorPhotoUrl} alt={comment.author} className="w-full h-full object-cover" />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center text-white/50">
                                                                            <User size={16} />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <div className="flex items-center justify-between">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="font-bold text-white">{comment.author}</span>
                                                                            {comment.timestamp && (
                                                                                <span className="text-xs font-mono text-white/70 bg-white/10 px-2 py-1 rounded flex items-center gap-1.5"><Clock size={12} /> {comment.timestamp}</span>
                                                                            )}
                                                                        </div>
                                                                        <div className="text-[10px] text-white/30">{comment.createdAt}</div>
                                                                    </div>
                                                                    
                                                                    {editingCommentId === comment.id ? (
                                                                        <div className="mt-2 flex gap-2">
                                                                            <input 
                                                                                type="text" 
                                                                                value={editedCommentText}
                                                                                onChange={(e) => setEditedCommentText(e.target.value)}
                                                                                className="flex-1 bg-black/40 border border-white/10 rounded px-2 py-1 text-sm text-white focus:outline-none focus:border-white/30"
                                                                                autoFocus
                                                                            />
                                                                            <button onClick={() => handleEditComment(version.id, comment.id)} className="text-green-400 hover:text-green-300"><Check size={16} /></button>
                                                                            <button onClick={() => setEditingCommentId(null)} className="text-red-400 hover:text-red-300"><X size={16} /></button>
                                                                        </div>
                                                                    ) : (
                                                                        <div className="flex justify-between items-start mt-0.5">
                                                                            <span className="text-white/70">{comment.text}</span>
                                                                            {isAuthor && (
                                                                                <div className="flex items-center gap-2">
                                                                                    <button onClick={() => { setEditingCommentId(comment.id); setEditedCommentText(comment.text); }} className="text-white/40 hover:text-white transition-colors" title="Modifier"><Edit2 size={12} /></button>
                                                                                    <button onClick={() => handleDeleteComment(version.id, comment.id)} className="text-white/40 hover:text-red-400 transition-colors" title="Supprimer"><Trash2 size={12} /></button>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        );
                                                    })
                                                ) : (
                                                    <div className="text-xs text-white/30 italic">Aucun commentaire pour cette version.</div>
                                                )}
                                            </div>

                                            {/* Input */}
                                            <div className="flex gap-2">
                                                <input 
                                                    type="text" 
                                                    value={newCommentTimestamp}
                                                    onChange={(e) => {
                                                        const val = e.target.value.replace(/[^0-9:]/g, "");
                                                        if (val.length === 2 && !val.includes(":") && val.length > newCommentTimestamp.length) {
                                                            setNewCommentTimestamp(val + ":");
                                                        } else if (val.length <= 5) {
                                                            setNewCommentTimestamp(val);
                                                        }
                                                    }}
                                                    placeholder="00:00"
                                                    className="w-16 bg-black/20 border border-white/10 rounded-lg px-2 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors text-center font-mono"
                                                />
                                                <input 
                                                    type="text" 
                                                    value={newComment}
                                                    onChange={(e) => setNewComment(e.target.value)}
                                                    onKeyDown={(e) => e.key === 'Enter' && handlePostComment(version.id)}
                                                    placeholder="Ajouter un commentaire..." 
                                                    className="flex-1 bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors"
                                                />
                                                <button 
                                                    onClick={() => handlePostComment(version.id)}
                                                    disabled={!newComment.trim()}
                                                    className="p-2 bg-white text-black rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    <Send size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-white/30 text-sm italic">Aucune version archivée.</div>
                        )}
                    </div>
                 </div>

                 {/* Paroles */}
                 <div className="bg-[#111] border border-white/5 rounded-3xl p-8 space-y-6">
                    <h3 className="text-lg font-medium text-white/80 flex items-center gap-2">
                        <AlignLeft size={20} /> Paroles
                    </h3>
                    {isEditing ? (
                        <textarea 
                            value={editData.lyrics || ""}
                            onChange={(e) => handleChange("lyrics", e.target.value)}
                            placeholder="Saisir les paroles..."
                            className="w-full h-96 bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-white/20 focus:outline-none focus:border-white transition-colors resize-y font-mono text-sm leading-relaxed"
                        />
                    ) : (
                        <div className="text-white/70 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                            {track.lyrics || <span className="italic text-white/30">Aucune parole disponible.</span>}
                        </div>
                    )}
                 </div>
            </div>
        </div>

        {/* Share Modal */}
        {isShareModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setIsShareModalOpen(false)}>
                <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-md m-4" onClick={e => e.stopPropagation()}>
                    <h3 className="text-xl font-bold mb-4">Partager ce morceau</h3>
                    <p className="text-white/60 text-sm mb-4">Ajoutez un collaborateur par son email.</p>
                    
                    <div className="space-y-4">
                        <div className="relative space-y-2">
                            <div className="flex gap-2">
                            <input
                                type="email"
                                value={shareEmail}
                                onChange={(e) => handleSearchUsers(e.target.value)}
                                placeholder="Email de l'utilisateur"
                                autoComplete="off"
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-white/30 focus:outline-none focus:border-white/30 transition-colors"
                            />
                            <button 
                                onClick={handleShare} 
                                disabled={!shareEmail.trim()} 
                                className="px-4 py-2 rounded-xl font-bold bg-white text-black hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                                Ajouter
                            </button>
                            </div>
                            
                            {(searchResults.length > 0 || (shareEmail.length > 0 && !selectedUser)) && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-[#222] border border-white/10 rounded-xl overflow-hidden z-100 shadow-2xl">
                                    {isSearching ? (
                                        <div className="p-4 text-center text-white/40 text-sm">Recherche en cours...</div>
                                    ) : searchResults.length > 0 ? (
                                        <div className="max-h-60 overflow-y-auto">
                                            {searchResults.map(user => (
                                                <button 
                                                    key={user.id}
                                                    onClick={() => {
                                                        setShareEmail(user.email);
                                                        setSelectedUser(user);
                                                        setSearchResults([]);
                                                    }}
                                                    className="w-full flex items-center gap-3 p-3 hover:bg-white/5 transition-colors text-left border-b border-white/5 last:border-0"
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-white/10 overflow-hidden shrink-0">
                                                        {user.photoURL ? (
                                                            <img src={user.photoURL} alt={user.displayName} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-white/5 text-white/50">
                                                                <User size={16} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-medium text-white truncate">{user.displayName || "Utilisateur sans nom"}</div>
                                                        <div className="text-xs text-white/50 truncate">{user.email}</div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    ) : shareEmail.length > 0 ? (
                                        <div className="p-4 text-center text-white/40 text-sm">Aucun utilisateur trouvé</div>
                                    ) : null}
                                </div>
                            )}
                        </div>
                        
                        {track.sharedWith && track.sharedWith.length > 0 && (
                            <div className="mt-4">
                                <h4 className="text-sm font-medium text-white/80 mb-2">Partagé avec :</h4>
                                <div className="space-y-2">
                                    {track.sharedWith.map((email: string, index: number) => (
                                        <div key={index} className="flex justify-between items-center bg-white/5 rounded-lg px-3 py-2">
                                            <span className="text-sm text-white/70">{email}</span>
                                            <button onClick={() => handleRemoveShare(email)} className="text-white/40 hover:text-red-400 transition-colors">
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setIsShareModalOpen(false)} className="px-4 py-2 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors">Fermer</button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
}
