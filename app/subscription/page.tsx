"use client";

import { useAuth } from "@/components/auth/AuthContext";
import { useAudio } from "@/components/audio/AudioContext";
import { Check } from "lucide-react";
import { PLANS, PlanType } from "@/lib/plans";

export default function SubscriptionPage() {
  const { user } = useAuth();
  const { userPlan } = useAudio();

  return (
    <div className="max-w-7xl mx-auto">
          <div className="text-center font-bold tracking-[0.2em] text-zinc-500 uppercase mb-4 mt-8">
            Votre workflow, sans limites.
          </div>
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
  );
}