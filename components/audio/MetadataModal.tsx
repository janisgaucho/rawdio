"use client";

import { useState, useEffect, useRef } from "react";
import { X, Check, Music2, Activity, User, Edit3, PlusCircle, SlidersHorizontal, Ear, Disc, Tag, Wand2, Loader2, Image as ImageIcon, Upload } from "lucide-react";

interface MetadataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: { 
    bpm: string; 
    key: string; 
    title: string; 
    auteur?: string;
    interprete?: string;
    beatmaker?: string;
    soundEngineer: string;
    type: string;
    genre: string;
    coverFile?: File;
  }) => void;
  filename: string;
  initialBpm: string;
  initialKey: string;
  initialTitle?: string;
  initialAuteur?: string;
  initialInterprete?: string;
  initialBeatmaker?: string;
  initialSoundEngineer?: string;
  initialType?: string;
  initialGenre?: string;
  file?: File;
  onDetectBpm?: (file: File) => Promise<string | null>;
}

export default function MetadataModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  filename, 
  initialBpm, 
  initialKey,
  initialTitle,
  initialAuteur,
  initialInterprete,
  initialBeatmaker,
  initialSoundEngineer,
  initialType,
  initialGenre,
  file,
  onDetectBpm
}: MetadataModalProps) {
  const KEYS_MAJOR = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
  const KEYS_MINOR = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'G#', 'A', 'Bb', 'B'];
  const GENRES = ["Hip-Hop", "Trap", "Drill", "R&B", "Pop", "Afro", "Electro", "House", "Techno", "Rock", "Jazz", "Soul", "Reggae", "Dancehall", "Zouk", "Variété", "Alternative", "Autre"];

  const [bpm, setBpm] = useState(initialBpm);
  const [title, setTitle] = useState("");
  const [auteur, setAuteur] = useState("");
  const [interprete, setInterprete] = useState("");
  // On remplace le string simple par un tableau pour gérer plusieurs beatmakers
  const [beatmakers, setBeatmakers] = useState<string[]>([""]);
  const [soundEngineer, setSoundEngineer] = useState("");
  const [type, setType] = useState("morceau");
  const [genre, setGenre] = useState("");
  const [showMore, setShowMore] = useState(false);
  const [note, setNote] = useState('');
  const [mode, setMode] = useState(''); // 'M' or 'm'
  const [isDetecting, setIsDetecting] = useState(false);
  const [generatedCover, setGeneratedCover] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setBpm(initialBpm === "-" ? "" : initialBpm);
    setTitle(initialTitle || filename.replace(/\.[^/.]+$/, ""));
    setAuteur(initialAuteur || "");
    setInterprete(initialInterprete || "");
    
    if (initialBeatmaker && initialBeatmaker !== "-") {
      setBeatmakers(initialBeatmaker.split(",").map(b => b.trim()));
    } else {
      setBeatmakers([""]);
    }

    setSoundEngineer(initialSoundEngineer && initialSoundEngineer !== "-" ? initialSoundEngineer : "");
    setType(initialType || "morceau");
    setGenre(initialGenre || "");
    
    // Si on a des infos avancées, on ouvre le panneau
    setShowMore(!!((initialBeatmaker && initialBeatmaker !== "-") || (initialSoundEngineer && initialSoundEngineer !== "-")));
    
    if (initialKey && initialKey !== '-') {
        const match = initialKey.match(/^([A-G][#b]?)(m|M)$/);
        if (match) {
            setNote(match[1]);
            setMode(match[2]);
        } else {
            setNote('');
            setMode('');
        }
    } else {
        setNote('');
        setMode('');
    }
    
    // Reset cover state on open
    setGeneratedCover(null);
    setCoverFile(undefined);
  }, [initialBpm, initialKey, isOpen, filename, initialTitle, initialAuteur, initialInterprete, initialBeatmaker, initialSoundEngineer, initialType, initialGenre]);

  const handleConfirm = () => {
    // On filtre les entrées vides et on joint par une virgule
    const formattedBeatmaker = beatmakers
      .map(b => b.trim())
      .filter(b => b !== "")
      .join(", ");

    onConfirm({
      bpm: bpm || "-",
      key: note && mode ? `${note}${mode}` : '-',
      title: title || filename.replace(/\.[^/.]+$/, ""),
      auteur: auteur || "-",
      interprete: interprete || "Unknown Artist",
      beatmaker: formattedBeatmaker || "-",
      soundEngineer: soundEngineer || "-",
      type: type,
      genre: genre || "Autre",
      coverFile: coverFile
    });
  };

  // Gestion des beatmakers multiples
  const handleBeatmakerChange = (index: number, value: string) => {
    const newBeatmakers = [...beatmakers];
    newBeatmakers[index] = value;
    setBeatmakers(newBeatmakers);
  };

  const addBeatmakerField = () => {
    setBeatmakers([...beatmakers, ""]);
  };

  const removeBeatmakerField = (index: number) => {
    const newBeatmakers = beatmakers.filter((_, i) => i !== index);
    setBeatmakers(newBeatmakers);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleConfirm();
    }
  };

  const handleAutoDetectBpm = async () => {
    if (!file || !onDetectBpm) return;
    
    setIsDetecting(true);
    try {
        const detected = await onDetectBpm(file);
        if (detected) setBpm(detected);
    } catch (error) {
        console.error("Erreur détection", error);
    } finally {
        setIsDetecting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setCoverFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setGeneratedCover(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  return (
    // 1. OVERLAY : Fond noir très léger pour laisser voir le site derrière + flou
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all"
      onClick={onClose}
    >
      
      {/* 2. CARD GLASSMORPHISM : C'est ici que la magie opère */}
      <div className="
        relative w-full max-w-3xl mx-4 max-h-[90vh] flex flex-col
        bg-black/30                     /* Fond sombre semi-transparent */
        backdrop-blur-2xl               /* Le flou intense (effet verre dépoli) */
        border border-white/10          /* Bordure très fine et subtile */
        rounded-3xl                     /* Coins très arrondis comme sur l'exemple */
        shadow-[0_20px_50px_rgba(0,0,0,0.5)] /* Ombre portée profonde */
        text-white
      "
      onClick={(e) => e.stopPropagation()}
      >
        
        {/* Effet de brillance en haut (optionnel, pour le réalisme) */}
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-white/20 to-transparent opacity-50"></div>

        {/* HEADER */}
        <div className="px-8 py-6 flex justify-between items-start shrink-0">
          <div>
            <h2 className="text-2xl font-light tracking-wide text-white/90">Métadonnées du morceau</h2>
            <p className="text-xs text-white/40 mt-1 font-medium tracking-wider uppercase truncate">{filename}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 text-white/60 hover:text-white transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* FORMULAIRE */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="space-y-8">

            {/* Section Cover Art Generator */}
            <div className="flex items-start gap-6 bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="w-32 h-32 shrink-0 bg-black/40 rounded-xl border border-white/10 flex items-center justify-center overflow-hidden relative group">
                    {generatedCover ? (
                        <>
                            <img src={generatedCover} alt="Cover Preview" className="w-full h-full object-cover" />
                            {/* Overlay Texte sur la prévisualisation */}
                            <div className="absolute inset-0 p-2 flex flex-col justify-start items-start bg-linear-to-b from-black/60 to-transparent pointer-events-none">
                                <h1 className="text-white text-[10px] font-bold leading-tight line-clamp-2 drop-shadow-md">{title}</h1>
                                <p className="text-white/90 text-[8px] font-light truncate w-full drop-shadow-sm">{interprete}</p>
                            </div>
                        </>
                    ) : (
                        <ImageIcon size={32} className="text-white/20" />
                    )}
                </div>
                <div className="flex-1 space-y-4">
                    <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-1">
                            Pochette du morceau
                        </h3>
                        <p className="text-xs text-white/50 leading-relaxed mb-3">
                            Importez une image depuis votre appareil.
                        </p>
                        
                        <div className="flex flex-wrap gap-3">
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-2 px-4 py-2 bg-white text-black hover:bg-gray-200 text-xs font-bold rounded-lg transition-colors"
                            >
                                <Upload size={14} /> Importer une image
                            </button>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Input Type (Prod / Morceau) */}
            <div className="space-y-3">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                    <Disc size={12} /> Type de fichier
                </label>
                <div className="grid grid-cols-2 gap-2 bg-white/5 border border-white/10 p-1 rounded-xl shadow-inner">
                    <button 
                        onClick={() => setType('instrumentale')}
                        className={`py-3 rounded-lg text-center text-sm transition-colors duration-200 ${type === 'instrumentale' ? 'bg-white text-black font-bold' : 'hover:bg-white/10'}`}
                    >
                        Instrumentale
                    </button>
                    <button 
                        onClick={() => setType('morceau')}
                        className={`py-3 rounded-lg text-center text-sm transition-colors duration-200 ${type === 'morceau' ? 'bg-white text-black font-bold' : 'hover:bg-white/10'}`}
                    >
                        Morceau
                    </button>
                </div>
            </div>

            {/* Input Titre */}
            <div className="space-y-3">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                    <Edit3 size={12} /> Titre du morceau
                </label>
                <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Titre du morceau"
                    autoFocus
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-lg font-light text-white placeholder-white/10 focus:outline-none focus:bg-white/10 focus:border-white/20 transition-all shadow-inner"
                />
            </div>

            {/* Champs conditionnels : Artiste ou Beatmaker */}
            {type === 'morceau' ? (
                <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2"><User size={12} /> Interprète</label>
                            <input type="text" value={interprete} onChange={(e) => setInterprete(e.target.value)} onKeyDown={handleKeyDown} placeholder="Nom de l'interprète" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-lg font-light text-white placeholder-white/10 focus:outline-none focus:bg-white/10 focus:border-white/20 transition-all shadow-inner"/>
                        </div>
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2"><Edit3 size={12} /> Auteur</label>
                            <input type="text" value={auteur} onChange={(e) => setAuteur(e.target.value)} onKeyDown={handleKeyDown} placeholder="Nom de l'auteur" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-lg font-light text-white placeholder-white/10 focus:outline-none focus:bg-white/10 focus:border-white/20 transition-all shadow-inner"/>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="space-y-3">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                        <SlidersHorizontal size={12} /> Beatmaker(s)
                    </label>
                    <div className="space-y-2">
                        {beatmakers.map((bm, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <input type="text" value={bm} onChange={(e) => handleBeatmakerChange(index, e.target.value)} onKeyDown={handleKeyDown} placeholder={index === 0 ? "Nom du beatmaker" : "Autre beatmaker"} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-lg font-light text-white placeholder-white/10 focus:outline-none focus:bg-white/10 focus:border-white/20 transition-all shadow-inner"/>
                                {index === beatmakers.length - 1 ? (
                                    <button onClick={addBeatmakerField} className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white transition-all shrink-0" title="Ajouter un autre beatmaker">
                                        <PlusCircle size={20} />
                                    </button>
                                ) : (
                                    <button onClick={() => removeBeatmakerField(index)} className="p-3 rounded-xl bg-white/5 hover:bg-red-500/20 border border-white/10 text-white/60 hover:text-red-400 transition-all shrink-0" title="Retirer ce beatmaker">
                                        <X size={20} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* BPM & Key */}
            <div className="grid grid-cols-2 gap-6">
                {/* Input BPM */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                        <Activity size={12} /> BPM
                    </label>
                    <div className="relative flex items-center">
                        <input 
                            type="text" 
                            inputMode="numeric"
                            maxLength={3}
                            value={bpm}
                            onChange={(e) => setBpm(e.target.value.replace(/[^0-9]/g, ''))}
                            onKeyDown={handleKeyDown}
                            placeholder="124"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-center text-lg font-light text-white placeholder-white/10 focus:outline-none focus:bg-white/10 focus:border-white/20 transition-all shadow-inner"
                        />
                        {file && onDetectBpm && (
                            <button
                                onClick={handleAutoDetectBpm}
                                disabled={isDetecting}
                                className="absolute right-2 p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Détecter automatiquement le BPM"
                            >
                                {isDetecting ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                            </button>
                        )}
                    </div>
                </div>

                {/* Input Key */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2"><Music2 size={12} /> Tonalité</label>
                    <div className="grid grid-cols-2 gap-2 bg-white/5 border border-white/10 p-1 rounded-xl shadow-inner">
                        <button 
                            onClick={() => setMode('M')}
                            className={`py-3 rounded-lg text-center text-sm transition-colors duration-200 ${mode === 'M' ? 'bg-white text-black font-bold' : 'hover:bg-white/10'}`}
                        >
                            Majeur
                        </button>
                        <button 
                            onClick={() => setMode('m')}
                            className={`py-3 rounded-lg text-center text-sm transition-colors duration-200 ${mode === 'm' ? 'bg-white text-black font-bold' : 'hover:bg-white/10'}`}
                        >
                            Mineur
                        </button>
                    </div>
                    {mode && <select 
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-center text-lg font-light text-white placeholder-white/10 focus:outline-none focus:bg-white/10 focus:border-white/20 transition-all shadow-inner appearance-none"
                    >
                        <option value="">Choisir la note...</option>
                        {(mode === 'M' ? KEYS_MAJOR : KEYS_MINOR).map(n => <option key={n} value={n}>{n}</option>)}
                    </select>}
                </div>
            </div>

            {/* Ingénieur du son */}
            <div className="space-y-3">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                    <Ear size={12} /> Ingénieur du son
                </label>
                <input type="text" value={soundEngineer} onChange={(e) => setSoundEngineer(e.target.value)} onKeyDown={handleKeyDown} placeholder="Nom de l'ingénieur du son" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-lg font-light text-white placeholder-white/10 focus:outline-none focus:bg-white/10 focus:border-white/20 transition-all shadow-inner"/>
            </div>

            {/* Input Genre */}
            <div className="space-y-3">
                <label className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                    <Tag size={12} /> Style / Genre
                </label>
                <div className="relative">
                    <select 
                        value={genre}
                        onChange={(e) => setGenre(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-lg font-light text-white placeholder-white/10 focus:outline-none focus:bg-white/10 focus:border-white/20 transition-all shadow-inner appearance-none cursor-pointer"
                    >
                        <option value="" className="bg-[#111] text-white/50">Sélectionner un style...</option>
                        {GENRES.map((g) => (
                            <option key={g} value={g} className="bg-[#111] text-white">{g}</option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-white/40">
                        <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                </div>
            </div>

          </div>
        </div>

        {/* FOOTER */}
        <div className="px-8 py-6 bg-black/20 border-t border-white/10 flex justify-between items-center backdrop-blur-xl shrink-0">
             <button 
                onClick={onClose}
                className="text-sm text-white/40 hover:text-white transition-colors font-medium px-4"
            >
                Ignorer ce fichier
            </button>

            <button 
                onClick={handleConfirm}
                className="
                    px-8 py-3 rounded-xl 
                    bg-white text-black 
                    font-bold text-sm tracking-wide
                    hover:bg-gray-200 hover:scale-105 active:scale-95
                    transition-all duration-200
                    shadow-[0_0_20px_rgba(255,255,255,0.15)]
                    flex items-center gap-2
                "
            >
                <Check size={16} strokeWidth={3} />
                VALIDER
            </button>
        </div>

      </div>
    </div>
  );
}