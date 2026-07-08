"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, Library, Mic2, KeyboardMusic, Sliders, Users, UploadCloud } from "lucide-react";
import { useAudio } from "@/components/audio/AudioContext";

export default function Sidebar() {
  const pathname = usePathname();
  const { sharedPlaylist } = useAudio();

  // Fonction pour déterminer les classes CSS du lien
  const getLinkClass = (path: string) => {
    const isActive = pathname === path;
    const baseClass = "flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all font-medium text-sm";
    
    if (isActive) {
      // Style actif : Fond clair, texte blanc, bordure visible
      return `${baseClass} bg-[#1a1a1a] text-white border border-[#333] hover:border-white/20`;
    }
    
    // Style inactif : Texte gris, hover blanc, fond transparent
    return `${baseClass} text-zinc-400 hover:text-white hover:bg-[#111] border border-transparent`;
  };

  return (
    <aside className="w-70 bg-[#050505] border-r border-[#222] flex flex-col z-20 shrink-0">
      
      {/* LOGO */}
      <div className="h-32 flex items-center justify-center border-b border-transparent">
         <div className="relative w-48 h-24">
            <Image 
              src="/logo.png" 
              alt="Rawdio Logo" 
              fill 
              sizes="192px"
              priority
              className="object-contain" 
            />
         </div>
      </div>
      
      {/* MENU */}
      <nav className="p-4 flex-1 overflow-y-auto">
        
        <div className="space-y-2">
            <Link href="/" className={getLinkClass("/")}>
                <Home size={20} />
                <span>Accueil</span>
            </Link>
            <Link href="/upload" className={getLinkClass("/upload")}>
                <UploadCloud size={20} />
                <span>Uploader un son</span>
            </Link>
            <Link href="/shared" className={getLinkClass("/shared")}>
                <Users size={20} />
                <span>Partagés avec vous</span>
            </Link>
            <Link href="/library" className={getLinkClass("/library")}>
                <Library size={20} />
                <span>Bibliothèque</span>
            </Link>
            <div className="ml-6 border-l border-white/10 pl-2 space-y-1">
                <Link href="/artists" className={getLinkClass("/artists")}>
                    <Mic2 size={18} />
                    <span>Artistes</span>
                </Link>
                <Link href="/beatmakers" className={getLinkClass("/beatmakers")}>
                    <KeyboardMusic size={18} />
                    <span>Beatmakers</span>
                </Link>
                <Link href="/engineers" className={getLinkClass("/engineers")}>
                    <Sliders size={18} />
                    <span>Ingénieur son</span>
                </Link>
            </div>
        </div>
      </nav>

      {/* VERSION */}
      <div className="p-6 text-xs text-zinc-700 font-mono text-center">
        v1.0.08 | <Link href="/legal" className="hover:text-zinc-300 transition-colors">Mentions légales</Link>
      </div>
    </aside>
  );
}
