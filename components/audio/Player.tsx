"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import WaveSurfer from "wavesurfer.js";
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, Repeat, Shuffle, AlertCircle } from "lucide-react";
import { useAudio } from "./AudioContext";

export default function Player() {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoop, setIsLoop] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentTrack, playlist, playTrack } = useAudio();

  // Initialisation du moteur audio
  useEffect(() => {
    if (!containerRef.current) return;

    wavesurfer.current = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "#525252",
      progressColor: "#ededed",
      cursorColor: "transparent",
      barWidth: 2,
      barGap: 3,
      height: 40,
      barRadius: 3,
      normalize: true,
    });

    // Appliquer le volume initial
    wavesurfer.current.setVolume(volume);

    wavesurfer.current.on("play", () => setIsPlaying(true));
    wavesurfer.current.on("pause", () => setIsPlaying(false));
    wavesurfer.current.on("finish", () => setIsPlaying(false));

    return () => wavesurfer.current?.destroy();
  }, []);

  // Chargement de la piste quand elle change
  useEffect(() => {
    if (currentTrack && wavesurfer.current) {
      setError(null);
      // On arrête la lecture précédente proprement
      wavesurfer.current.stop();

      const onReady = () => {
        wavesurfer.current?.play();
      };

      const onError = (err: any) => {
        console.error("Erreur lecture audio (Vérifiez URL/CORS):", err);
        setError("Erreur de lecture");
      };

      // Abonnement aux événements (Compatible v6 et v7)
      const readySub = wavesurfer.current.on("ready", onReady);
      const errorSub = wavesurfer.current.on("error", onError);

      // Gestion des URLs relatives (si le domaine manquait lors de l'upload)
      let audioUrl = currentTrack.url;
      if (audioUrl.startsWith('/')) {
        const r2Domain = process.env.NEXT_PUBLIC_R2_DOMAIN;
        if (r2Domain) {
          audioUrl = `${r2Domain.replace(/\/$/, '')}${audioUrl}`;
        } else {
          console.error("⚠️ URL relative détectée mais NEXT_PUBLIC_R2_DOMAIN est manquant dans le .env !");
          setError("Config R2 manquante");
          return;
        }
      }

      wavesurfer.current.load(audioUrl);

      return () => {
        // Nettoyage des listeners
        if (typeof readySub === 'function') readySub();
        else wavesurfer.current?.un("ready", onReady);

        if (typeof errorSub === 'function') errorSub();
        else wavesurfer.current?.un("error", onError);
      };
    }
  }, [currentTrack]);

  // Gestion de la navigation (Next / Prev)
  const handleNext = useCallback(() => {
    if (!currentTrack || playlist.length === 0) return;
    
    if (isShuffle) {
        const randomIndex = Math.floor(Math.random() * playlist.length);
        playTrack(playlist[randomIndex]);
    } else {
        const currentIndex = playlist.findIndex(t => t.id === currentTrack.id);
        const nextIndex = (currentIndex + 1) % playlist.length;
        playTrack(playlist[nextIndex]);
    }
  }, [currentTrack, playlist, isShuffle, playTrack]);

  const handlePrev = useCallback(() => {
    if (!currentTrack || playlist.length === 0) return;
    
    // Si on est à plus de 3 secondes, on recommence le morceau
    if (wavesurfer.current && wavesurfer.current.getCurrentTime() > 3) {
        wavesurfer.current.seekTo(0);
        wavesurfer.current.play();
        return;
    }

    const currentIndex = playlist.findIndex(t => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    playTrack(playlist[prevIndex]);
  }, [currentTrack, playlist, playTrack]);

  // Gestion de la fin du morceau (Boucle ou Suivant)
  useEffect(() => {
    if (!wavesurfer.current) return;

    const onFinish = () => {
        if (isLoop) {
            wavesurfer.current?.seekTo(0);
            wavesurfer.current?.play();
        } else {
            handleNext();
        }
    };

    // On supprime l'ancien listener avant d'en ajouter un nouveau
    wavesurfer.current.un("finish", onFinish);
    wavesurfer.current.on("finish", onFinish);

    return () => { wavesurfer.current?.un("finish", onFinish); };
  }, [isLoop, handleNext]);

  const togglePlay = () => {
    if (currentTrack) wavesurfer.current?.playPause();
  };

  const toggleMute = () => {
    if (!wavesurfer.current) return;
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    wavesurfer.current.setMuted(newMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (wavesurfer.current) {
      wavesurfer.current.setVolume(newVolume);
      // Si on bouge le slider alors que c'est muet, on réactive le son
      if (isMuted && newVolume > 0) {
        setIsMuted(false);
        wavesurfer.current.setMuted(false);
      }
    }
  };

  return (
    <div className="w-full h-full flex items-center px-6 gap-6 pl-16">
      
      {/* Contrôles Gauche */}
      <div className="flex items-center gap-6 min-w-64">
        
        {/* Boutons de navigation */}
        <div className="flex items-center gap-3">
            <button onClick={() => setIsShuffle(!isShuffle)} className={`hover:text-white transition ${isShuffle ? 'text-green-400' : 'text-zinc-600'}`} title="Aléatoire">
                <Shuffle size={16} />
            </button>
            
            <button onClick={handlePrev} className="text-zinc-400 hover:text-white transition" title="Précédent">
                <SkipBack size={20} fill="currentColor" />
            </button>

            <button 
              onClick={togglePlay}
              disabled={!currentTrack}
              className={`w-10 h-10 flex items-center justify-center rounded-full transition ${currentTrack ? 'bg-white text-black hover:scale-105' : 'bg-[#222] text-gray-500 cursor-not-allowed'}`}
            >
              {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
            </button>

            <button onClick={handleNext} className="text-zinc-400 hover:text-white transition" title="Suivant">
                <SkipForward size={20} fill="currentColor" />
            </button>

            <button onClick={() => setIsLoop(!isLoop)} className={`hover:text-white transition ${isLoop ? 'text-green-400' : 'text-zinc-600'}`} title="En boucle">
                <Repeat size={16} />
            </button>
        </div>
        
        <div className="flex flex-col justify-center overflow-hidden">
          <span className="text-sm font-bold text-white truncate max-w-50">
            {currentTrack ? currentTrack.title : "Aucune lecture"}
          </span>
          <span className="text-xs text-gray-400 truncate max-w-50">
            {error ? <span className="text-red-400 flex items-center gap-1"><AlertCircle size={12}/> {error}</span> : (currentTrack ? currentTrack.artist : "Sélectionne une piste")}
          </span>
        </div>
      </div>

      {/* Waveform */}
      <div 
        ref={containerRef} 
        className="flex-1 h-10 opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
      />

      {/* Volume */}
      <div className="flex items-center gap-3 text-gray-400 min-w-25 justify-end">
        <button onClick={toggleMute} className="hover:text-white transition">
          {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
        
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.05" 
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          className="w-20 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white hover:accent-gray-200"
          style={{
            background: `linear-gradient(to right, white ${isMuted ? 0 : volume * 100}%, #3f3f46 ${isMuted ? 0 : volume * 100}%)`
          }}
        />
      </div>

    </div>
  );
}