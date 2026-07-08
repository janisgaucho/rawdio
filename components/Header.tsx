"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from "@/components/auth/AuthContext";
import { MoreVertical, User, CreditCard, LogOut, HardDrive, Home, UploadCloud, Users, Library, MicVocal, KeyboardMusic, SlidersVertical, Bug, SquarePen } from 'lucide-react';

const pageTitles: { [key: string]: { title: string; icon: React.ReactNode } } = {
    '/': { title: 'Accueil', icon: <Home size={28} /> },
    '/upload': { title: 'Uploader un son', icon: <UploadCloud size={28} /> },
    '/shared': { title: 'Partagés avec vous', icon: <Users size={28} /> },
    '/library': { title: 'Bibliothèque', icon: <Library size={28} /> },
    '/artists': { title: 'Artistes', icon: <MicVocal size={28} /> },
    '/beatmakers': { title: 'Beatmakers', icon: <KeyboardMusic size={28} /> },
    '/engineers': { title: 'Ingénieurs son', icon: <SlidersVertical size={28} /> },
    '/storage': { title: 'Stockage', icon: <HardDrive size={28} /> },
    '/account': { title: 'Mon Compte', icon: <User size={28} /> },
    '/subscription': { title: 'Abonnement', icon: <CreditCard size={28} /> },
    '/contact': { title: 'Contact', icon: <SquarePen size={28} /> },
};

export default function Header() {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    const currentPage = pageTitles[pathname] || { title: 'Rawdio', icon: null };

    if (!user) return null;

    return (
        <header className="sticky top-0 z-30 bg-black/90 backdrop-blur-xl border-b border-white/5 shrink-0">
            <div className="px-8 pb-4 pt-8 flex items-center justify-between">
                <div className="flex items-stretch gap-4">
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        {currentPage.icon} {currentPage.title}
                    </h1>
                </div>
                
                <div className="relative flex items-center gap-4">
                    <Link href="/contact?type=bug" className="self-stretch group flex items-center justify-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-3 text-xs font-medium text-yellow-300 transition-colors hover:bg-yellow-500/20 hover:border-yellow-500/50">
                        <Bug size={14} />
                        <span>Signaler un bug</span>
                    </Link>
                    <div className="text-right">
                        <div className="text-sm font-bold text-white">{user.displayName}</div>
                        <div className="text-xs text-zinc-400">{user.email}</div>
                    </div>
                    <button 
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className={`p-2 rounded-full text-white transition cursor-pointer ${isUserMenuOpen ? 'bg-white/20' : 'bg-white/5 hover:bg-white/10'}`}
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
            </div>
        </header>
    );
}