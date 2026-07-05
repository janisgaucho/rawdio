"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthContext";
import { useAudio } from "@/components/audio/AudioContext";
import { CreditCard, MoreVertical, User, LogOut, HardDrive, Check } from "lucide-react";
import { PLANS, PlanType } from "@/lib/plans";

export default function SubscriptionPage() {
  const { user, logout } = useAuth();
  const { userPlan } = useAudio();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <main className="flex-1 overflow-y-auto pb-40">
      <div className="max-w-7xl mx-auto">
        <div className="sticky top-0 z-30 bg-black/90 backdrop-blur-xl px-8 py-8 flex items-center justify-between mb-8 border-b border-white/5">
          <div>
            <h1 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
              <CreditCard size={28} /> Abonnement
            </h1>
            <p className="text-zinc-500">Gérez votre abonnement et vos options.</p>
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
          <p className="text-center text-zinc-400 mb-12 max-w-2xl mx-auto">
            Choisissez l'offre qui correspond à vos besoins. Passez à une offre supérieure à tout moment pour plus d'espace de stockage et de fonctionnalités.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {Object.entries(PLANS).map(([planId, planDetails]) => {
              // Sécurité : on vérifie que le plan de l'utilisateur existe bien dans la config
              // avant de faire la comparaison. Sinon, on considère le plan "free" comme plan courant.
              const safeUserPlan = userPlan in PLANS ? userPlan : 'free';
              const isCurrentPlan = safeUserPlan === planId;
              return (
                <div 
                  key={planId}
                  className={`bg-[#111] border rounded-3xl p-8 flex flex-col transition-all duration-300 ${isCurrentPlan ? 'border-white/30 scale-105 shadow-2xl shadow-white/5' : 'border-white/10 hover:border-white/20'}`}
                >
                  <div className="grow">
                    <div className="flex justify-between items-start">
                      <h3 className="text-2xl font-bold text-white">{planDetails.name}</h3>
                      {isCurrentPlan && (
                        <span className="text-xs font-bold bg-white text-black px-3 py-1 rounded-full">Actuel</span>
                      )}
                    </div>
                    <p className="text-4xl font-black text-white my-6">
                      {planDetails.price} <span className="text-lg font-medium text-zinc-400">/ mois</span>
                    </p>
                    <ul className="space-y-3 text-zinc-300">
                      {planDetails.features.map((feature: string, index: number) => (
                        <li key={index} className="flex items-start gap-3">
                          <Check size={16} className="text-green-400 mt-1 shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-10">
                    <button 
                      disabled={isCurrentPlan}
                      className="w-full py-3 px-6 rounded-xl font-bold text-center transition-colors disabled:cursor-not-allowed
                        bg-white text-black hover:bg-gray-200 disabled:bg-white/10 disabled:text-zinc-500
                      "
                    >
                      {isCurrentPlan ? "Votre offre actuelle" : "Choisir cette offre"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </main>
  );
}