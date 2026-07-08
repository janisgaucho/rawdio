"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
// Imports Firestore (Base de données)
import { db } from "@/lib/firebase";
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc, getDoc, where, setDoc, QuerySnapshot } from "firebase/firestore";
// Import de la nouvelle modale
import MetadataModal from "./MetadataModal";
// Import du contexte d'auth
import { useAuth } from "@/components/auth/AuthContext";
// Import des Server Actions R2
import { getUploadUrl, deleteFile } from "../../app/actions/storage";
import { analyzeAudioFile, detectBpmFromFile, formatDuration } from "@/lib/audioAnalysis";
import { getPlanLimit } from "@/lib/plans";

export type Comment = {
  id: string;
  text: string;
  createdAt: string;
  author: string;
  timestamp?: string;
};

export type TrackVersion = {
  id: string;
  name: string;
  url: string;
  duration: string;
  createdAt: string;
  bpm?: string;
  key?: string;
  comments?: Comment[];
  authorId?: string;
  authorName?: string;
  authorPhotoUrl?: string;
  size?: number;
  fileType?: string;
  bitrate?: number;
  sampleRate?: number;
};

export type Track = {
  id: string;
  title: string;
  auteur?: string;
  interprete?: string;
  bpm: string;
  key: string;
  duration: string;
  date: string;
  url: string;
  type?: string;
  genre?: string;
  beatmaker?: string;
  soundEngineer?: string;
  versions?: TrackVersion[];
  isFavorite?: boolean;
  coverUrl?: string | null;
  userId?: string; // Ajout du champ userId
  lyrics?: string;
  sharedWith?: string[];
};

type AudioContextType = {
  currentTrack: Track | null;
  playlist: Track[];
  sharedPlaylist: Track[];
  isPlaying: boolean;
  isUploading: boolean;
  playTrack: (track: Track) => void;
  uploadTrack: (file: File) => Promise<void>;
  deleteTrack: (trackId: string, fileUrl: string) => Promise<void>;
  editTrack: (track: Track) => void;
  uploadVersion: (track: Track, file: File) => Promise<void>;
  addComment: (trackId: string, versionId: string, text: string, timestamp?: string) => Promise<void>;
  restoreVersion: (track: Track, version: TrackVersion) => Promise<void>;
  toggleFavorite: (track: Track) => Promise<void>;
  finalizeUpload: (file: File, data: any, coverFile?: File) => Promise<void>;
  storageUsed: number; // On expose l'espace utilisé
  userPlan: string;    // On expose le plan actuel
  wavesurferRef: React.MutableRefObject<any | null>;
  setIsPlaying: (playing: boolean) => void;
};

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [sharedPlaylist, setSharedPlaylist] = useState<Track[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [storageUsed, setStorageUsed] = useState(0);
  const [userPlan, setUserPlan] = useState<string>("free");
  
  // Récupération de l'utilisateur connecté
  const { user } = useAuth();
  const wavesurferRef = useRef<any | null>(null);

  // Synchronisation du profil utilisateur dans Firestore
  useEffect(() => {
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      
      // On récupère d'abord le document pour voir si un plan existe déjà
      getDoc(userDocRef).then((docSnap) => {
        const currentData = docSnap.exists() ? docSnap.data() : {};
        
        const userData = {
          uid: user.uid,
          email: user.email,
          emailLower: user.email?.toLowerCase(),
          displayName: user.displayName || "Utilisateur",
          photoURL: user.photoURL,
          lastSeen: new Date(),
          // Si le champ 'plan' n'existe pas, on le met à "free" par défaut. Sinon on ne touche pas.
          plan: currentData.plan || "free"
        };

        setDoc(userDocRef, userData, { merge: true })
          .catch((err: any) => console.error("Erreur sync profil:", err));
      });

      // Écoute en temps réel du profil pour récupérer le plan (ex: si l'user upgrade son abo)
      const unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.plan) setUserPlan(data.plan);
        }
      });
      return () => unsubscribeUser();
    }
  }, [user]);

  // --- NOUVEAUX ÉTATS POUR LA MODALE ---
  const [showModal, setShowModal] = useState(false);
  const [pendingFile, setPendingFile] = useState<{ file: File, duration: string, bpm: string, key: string, bitrate: number, sampleRate: number } | null>(null);
  const [editingTrack, setEditingTrack] = useState<Track | null>(null);

  useEffect(() => {
    if (!user) {
      setPlaylist([]);
      setSharedPlaylist([]);
      return;
    }

    // MODIFICATION : On retire orderBy("createdAt", "desc") ici pour éviter l'erreur d'index.
    // On récupère simplement les sons de l'utilisateur, et on les triera juste après en JS.
    const q = query(
      collection(db, "tracks"), 
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot) => {
      // 1. On trie les documents manuellement (du plus récent au plus ancien)
      const sortedDocs = [...snapshot.docs].sort((a, b) => {
        // Si la date n'est pas encore définie (upload en cours), on prend la date actuelle
        const dateA = a.data().createdAt?.seconds ?? Date.now() / 1000;
        const dateB = b.data().createdAt?.seconds ?? Date.now() / 1000;
        return dateB - dateA;
      });

      // 2. On mappe les données
      const tracksData = sortedDocs.map((doc) => {
        const data = doc.data();
        let dateDisplay = "Just now";
        if (data.createdAt?.seconds) {
           const dateObj = new Date(data.createdAt.seconds * 1000);
           dateDisplay = dateObj.toLocaleDateString("fr-FR", { day: 'numeric', month: 'short' });
        }
        return { id: doc.id, ...data, date: dateDisplay } as Track;
      });
      setPlaylist(tracksData);

      // CALCUL DU STOCKAGE UTILISÉ
      // On additionne la taille de toutes les versions de tous les morceaux
      const totalBytes = tracksData.reduce((acc, track) => {
        const trackVersionsSize = track.versions?.reduce((vAcc, v) => vAcc + (v.size || 0), 0) || 0;
        return acc + trackVersionsSize;
      }, 0);
      setStorageUsed(totalBytes);

    }, (error: any) => {
      console.error("Erreur récupération playlist:", error);
    });

    // 2. Récupération des sons PARTAGÉS avec l'utilisateur (via son email)
    let unsubscribeShared = () => {};
    if (user.email) {
      const emailQuery = user.email.toLowerCase().trim();

      const qShared = query(
        collection(db, "tracks"),
        where("sharedWith", "array-contains", emailQuery)
      );

      unsubscribeShared = onSnapshot(qShared, (snapshot: QuerySnapshot) => {
        const sortedDocs = [...snapshot.docs].sort((a, b) => {
          const dateA = a.data().createdAt?.seconds ?? Date.now() / 1000;
          const dateB = b.data().createdAt?.seconds ?? Date.now() / 1000;
          return dateB - dateA;
        });

        const tracksData = sortedDocs.map((doc) => {
          const data = doc.data();
          let dateDisplay = "Just now";
          if (data.createdAt?.seconds) {
             const dateObj = new Date(data.createdAt.seconds * 1000);
             dateDisplay = dateObj.toLocaleDateString("fr-FR", { day: 'numeric', month: 'short' });
          }
          return { id: doc.id, ...data, date: dateDisplay } as Track;
        });
        setSharedPlaylist(tracksData);
      }, (error: any) => {
        console.error("Erreur récupération shared playlist (Vérifiez les règles Firestore) :", error);
      });
    }

    return () => {
      unsubscribe();
      unsubscribeShared();
    };
  }, [user]);

  const playTrack = (track: Track) => {
    // Si on clique sur le morceau déjà en cours, on bascule play/pause
    if (currentTrack?.id === track.id) {
      wavesurferRef.current?.playPause();
    } else {
      // Sinon, on charge le nouveau morceau
      setCurrentTrack(track);
    }
  };

  // 1. DÉBUT DE L'UPLOAD : Analyse
  const uploadTrack = async (file: File) => {
    if (!user) {
      alert("Vous devez être connecté pour uploader un son.");
      return;
    }
    if (!file) return;
    const metadata = await analyzeAudioFile(file);

    // On ouvre TOUJOURS la modale pour permettre à l'utilisateur de vérifier/modifier les infos
    setPendingFile({ file, ...metadata });
    setShowModal(true);
  };

  // 1b. DÉBUT DE L'ÉDITION
  const editTrack = (track: Track) => {
    setEditingTrack(track);
    setShowModal(true);
  };

  // 2. FIN DE L'UPLOAD (Appelé par la modale)
  const finalizeUpload = async (
    file: File, 
    data: { bpm: string; key: string; title: string; auteur?: string; interprete?: string; beatmaker?: string; soundEngineer: string; duration: string; type: string; genre: string; bitrate?: number; sampleRate?: number },
    coverFile?: File
  ) => {
    if (!user) {
      alert("Erreur : Utilisateur non connecté.");
      return;
    }

    // VÉRIFICATION DU QUOTA AVANT UPLOAD
    const limit = getPlanLimit(userPlan);
    // On estime la taille totale (Audio + Cover éventuelle)
    const estimatedSize = file.size + (coverFile ? coverFile.size : 0);
    if (storageUsed + estimatedSize > limit) {
      alert(`Espace de stockage insuffisant (${(limit / 1024 / 1024).toFixed(0)} Mo max). Passez à l'offre supérieure !`);
      return;
    }

    setIsUploading(true);
    setShowModal(false); // On ferme la modale si elle était ouverte
    setPendingFile(null);

    try {
      // --- NOUVEAU FLUX D'UPLOAD ---
      // 1. Obtenir l'URL pré-signée pour l'audio
      const { signedUrl: audioSignedUrl, publicUrl: audioPublicUrl } = await getUploadUrl(file.name, file.type, "uploads");

      // 2. Uploader le fichier audio directement vers R2
      await fetch(audioSignedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      const downloadURL = audioPublicUrl;

      // 3. Gérer l'upload de la cover (si présente) de la même manière
      let coverUrl = null;
      if (coverFile) {
        try {
          const { signedUrl: coverSignedUrl, publicUrl: coverPublicUrl } = await getUploadUrl(coverFile.name, coverFile.type, "covers");
          await fetch(coverSignedUrl, {
            method: 'PUT',
            body: coverFile,
            headers: { 'Content-Type': coverFile.type },
          });
          coverUrl = coverPublicUrl;
        } catch (e) {
          console.error("Erreur upload cover:", e);
          // On continue même si la cover échoue
        }
      }

      // 4. Création de la version initiale (v1.0)
      const initialVersion: TrackVersion = {
        id: Date.now().toString(),
        name: "v1.0",
        url: downloadURL,
        duration: data.duration,
        createdAt: new Date().toLocaleDateString("fr-FR"),
        bpm: data.bpm,
        key: data.key,
        size: file.size, // On utilise la taille du fichier local
        fileType: file.type, // On utilise le type du fichier local
        bitrate: data.bitrate,
        sampleRate: data.sampleRate
      };

      // 5. Ajouter la piste à Firestore
      await addDoc(collection(db, "tracks"), {
        title: data.title,
        auteur: data.auteur,
        interprete: data.interprete,
        bpm: data.bpm,     
        key: data.key,     
        duration: data.duration,
        beatmaker: data.beatmaker,
        soundEngineer: data.soundEngineer,
        type: data.type,
        genre: data.genre,
        versions: [initialVersion], // On initialise le tableau des versions
        url: downloadURL,
        createdAt: new Date(),
        coverUrl: coverUrl,
        userId: user.uid, // On lie le son à l'utilisateur (garanti non null ici)
        sharedWith: [] // Initialisation du tableau de partage
      });

    } catch (error: any) {
      console.error("Erreur Upload:", error);
      alert(`Une erreur est survenue pendant l'upload : ${error.message || "Erreur inconnue"}`);
    } finally {
      setIsUploading(false);
    }
  };

  // 3. UPLOAD D'UNE NOUVELLE VERSION
  const uploadVersion = async (track: Track, file: File) => {
    // VÉRIFICATION DU QUOTA
    const limit = getPlanLimit(userPlan);
    if (storageUsed + file.size > limit) {
      alert("Espace de stockage insuffisant pour cette nouvelle version.");
      return;
    }

    setIsUploading(true);
    try {
      // 1. Analyser le nouveau fichier
      const metadata = await analyzeAudioFile(file);
      
      // 2. Obtenir l'URL pré-signée et uploader le fichier
      const { signedUrl, publicUrl } = await getUploadUrl(file.name, file.type, "uploads");
      await fetch(signedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      const downloadURL = publicUrl;
      
      // 3. Gestion de l'historique des versions
      let updatedVersions = track.versions ? [...track.versions] : [];

      // Si c'est un ancien morceau sans historique, on crée la v1 à partir des données actuelles
      if (updatedVersions.length === 0) {
        updatedVersions.push({
          id: "legacy_v1",
          name: "v1.0",
          url: track.url,
          duration: track.duration,
          createdAt: track.date,
          bpm: track.bpm,
          key: track.key
        });
      }

      // Création de la nouvelle version
      const newVersionName = `v${updatedVersions.length + 1}.0`;
      const newVersion: TrackVersion = {
        id: Date.now().toString(),
        name: newVersionName,
        url: downloadURL,
        duration: metadata.duration,
        createdAt: new Date().toLocaleDateString("fr-FR"),
        bpm: metadata.bpm,
        key: metadata.key,
        authorId: user?.uid,
        authorName: user?.displayName || "Utilisateur",
        authorPhotoUrl: user?.photoURL || undefined,
        size: file.size,
        fileType: file.type,
        bitrate: metadata.bitrate,
        sampleRate: metadata.sampleRate
      };

      updatedVersions.push(newVersion);

      // 4. Mise à jour du document (La nouvelle version devient la principale)
      await updateDoc(doc(db, "tracks", track.id), {
        url: downloadURL, // Le lien principal pointe vers la nouvelle version
        duration: metadata.duration,
        versions: updatedVersions
      });

    } catch (error) {
      console.error("Erreur upload version:", error);
      alert("Erreur lors de l'ajout de la version");
    } finally {
      setIsUploading(false);
    }
  };

  // 4. AJOUTER UN COMMENTAIRE
  const addComment = async (trackId: string, versionId: string, text: string, timestamp?: string) => {
    try {
      const trackRef = doc(db, "tracks", trackId);
      const trackSnap = await getDoc(trackRef);

      if (trackSnap.exists()) {
        const trackData = trackSnap.data() as Track;
        const versions = trackData.versions || [];
        
        const updatedVersions = versions.map(v => {
          if (v.id === versionId) {
            const newComment: Comment = {
              id: Date.now().toString(),
              text,
              createdAt: new Date().toLocaleDateString("fr-FR"),
              author: "Moi", // Pour l'instant, on met "Moi" par défaut
              timestamp
            };
            return { ...v, comments: [...(v.comments || []), newComment] };
          }
          return v;
        });

        await updateDoc(trackRef, { versions: updatedVersions });
      }
    } catch (error) {
      console.error("Erreur ajout commentaire:", error);
    }
  };

  // 5. RESTAURER UNE VERSION (Définir comme actuelle)
  const restoreVersion = async (track: Track, version: TrackVersion) => {
    try {
      await updateDoc(doc(db, "tracks", track.id), {
        url: version.url,
        duration: version.duration,
        ...(version.bpm ? { bpm: version.bpm } : {}), // Met à jour le BPM si dispo dans la version
        ...(version.key ? { key: version.key } : {})  // Met à jour la Clé si dispo dans la version
      });
    } catch (error) {
      console.error("Erreur restauration version:", error);
      alert("Erreur lors du changement de version principale");
    }
  };

  // Fonction appelée quand l'user valide la modale
  const handleModalConfirm = async (data: { bpm: string; key: string; title: string; auteur?: string; interprete?: string; beatmaker?: string; soundEngineer: string; type: string; genre: string; coverFile?: File }) => {
    if (pendingFile) {
      // Cas UPLOAD
      finalizeUpload(pendingFile.file, { ...data, duration: pendingFile.duration, bitrate: pendingFile.bitrate, sampleRate: pendingFile.sampleRate }, data.coverFile);
    } else if (editingTrack) {
      // Cas ÉDITION
      let newCoverUrl = editingTrack.coverUrl;

      if (data.coverFile) {
        // Si une nouvelle cover est uploadée, on utilise le même flux
        try {
          const { signedUrl, publicUrl } = await getUploadUrl(data.coverFile.name, data.coverFile.type, "covers");
          await fetch(signedUrl, {
            method: 'PUT',
            body: data.coverFile,
            headers: { 'Content-Type': data.coverFile.type },
          });
          
          // On supprime l'ancienne cover si elle existe et si l'upload de la nouvelle a réussi
          if (editingTrack.coverUrl) {
             await deleteFile(editingTrack.coverUrl).catch((e: unknown) => console.warn("Erreur suppression ancienne cover:", e));
          }

          newCoverUrl = publicUrl;

        } catch (error) {
          console.error("Erreur upload cover:", error);
        }
      }

      const { coverFile, ...trackData } = data;

      updateDoc(doc(db, "tracks", editingTrack.id), {
        ...trackData,
        coverUrl: newCoverUrl
      }).then(() => {
        setEditingTrack(null);
        setShowModal(false);
      }).catch((err: any) => {
        console.error("Erreur update:", err);
        alert("Erreur lors de la mise à jour.");
      });
    }
  };

  const deleteTrack = async (trackId: string, fileUrl: string) => {
    if (!confirm("Supprimer ce son définitivement ?")) return;
    try {
        // 1. On récupère les infos du morceau pour trouver tous les fichiers liés (Cover, Versions...)
        const trackRef = doc(db, "tracks", trackId);
        const trackSnap = await getDoc(trackRef);

        if (trackSnap.exists()) {
          const data = trackSnap.data() as Track;

          // Supprime le fichier audio principal
          if (data.url) await deleteFile(data.url).catch((e) => console.warn("Erreur delete audio:", e));
          
          // Supprime la cover si elle existe
          if (data.coverUrl) await deleteFile(data.coverUrl).catch((e) => console.warn("Erreur delete cover:", e));

          // Supprime les fichiers des autres versions
          if (data.versions && data.versions.length > 0) {
            for (const v of data.versions) {
              if (v.url && v.url !== data.url) await deleteFile(v.url).catch((e) => console.warn("Erreur delete version:", e));
            }
          }
        }

        // 2. Une fois le ménage fait sur R2, on supprime la fiche Firestore
        await deleteDoc(trackRef);
        if (currentTrack?.id === trackId) setCurrentTrack(null);
    } catch (error) {
        console.error(error);
        alert("Erreur lors de la suppression");
    }
  };

  // 6. TOGGLE FAVORITE
  const toggleFavorite = async (track: Track) => {
    try {
      const trackRef = doc(db, "tracks", track.id);
      await updateDoc(trackRef, {
        isFavorite: !track.isFavorite
      });
    } catch (error) {
      console.error("Erreur toggleFavorite:", error);
    }
  };

  return (
    <AudioContext.Provider value={{ currentTrack, playlist, sharedPlaylist, isPlaying, setIsPlaying, isUploading, playTrack, uploadTrack, deleteTrack, editTrack, uploadVersion, addComment, restoreVersion, toggleFavorite, finalizeUpload, storageUsed, userPlan, wavesurferRef }}>
      {children}
      
      {/* LA MODALE EST RENDUE ICI, GLOBALEMENT */}
      <MetadataModal 
        isOpen={showModal}
        onClose={() => { setShowModal(false); setPendingFile(null); setEditingTrack(null); }}
        onConfirm={handleModalConfirm}
        filename={pendingFile?.file.name || editingTrack?.title || ""}
        initialBpm={pendingFile?.bpm || editingTrack?.bpm || ""}
        initialKey={pendingFile?.key || editingTrack?.key || ""}
        initialTitle={editingTrack?.title}
        initialAuteur={editingTrack?.auteur}
        initialInterprete={editingTrack?.interprete}
        initialBeatmaker={editingTrack?.beatmaker}
        initialSoundEngineer={editingTrack?.soundEngineer}
        initialType={editingTrack?.type}
        initialGenre={editingTrack?.genre}
        file={pendingFile?.file}
        onDetectBpm={detectBpmFromFile}
      />
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) throw new Error("useAudio doit être utilisé dans un AudioProvider");
  return context;
}