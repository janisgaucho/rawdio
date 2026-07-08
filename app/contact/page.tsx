"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { Send, Bug, MessageSquare, Paperclip, Loader2, CheckCircle, ChevronDown } from 'lucide-react';
import { sendContactEmail } from '@/app/actions/sendEmail';


export default function ContactPage() {
  const searchParams = useSearchParams();
  const [formType, setFormType] = useState<'general' | 'bug'>('general');
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'bug') {
      setFormType('bug');
    }
  }, [searchParams]);

  const handleSubmit = async (formData: FormData) => {
    setIsPending(true);
    formData.append('type', formType); 
    
    // Ajout des données techniques UNIQUEMENT si c'est un bug
    if (formType === 'bug') {
      formData.append('userAgent', navigator.userAgent);
      formData.append('screenResolution', `${window.innerWidth}x${window.innerHeight}`);
      formData.append('language', navigator.language);
    }
    
    const result = await sendContactEmail(formData);

    setIsPending(false);

    if (result.success) {
      setIsSuccess(true);
      formRef.current?.reset();
      setTimeout(() => {
        setIsSuccess(false);
      }, 5000);
    }
  }

  return (
    <div className="w-full">
      <main className="max-w-2xl mx-auto py-12 w-full">
        
        {/* Titre de la page */}
        <div className="mb-12">
          <h1 className="text-4xl font-black tracking-tight text-white mb-4">Contact</h1>
          <p className="text-zinc-400 text-lg">
            Une question, une proposition ou un problème technique ? Sélectionnez le motif de votre demande ci-dessous.
          </p>
        </div>

        {/* Sélecteur de type de formulaire (Onglets) */}
        <div className="flex p-1 bg-zinc-900/50 border border-zinc-800 rounded-xl mb-8">
          <button
            onClick={() => setFormType('general')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
              formType === 'general' 
                ? 'bg-zinc-800 text-white shadow-sm' 
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Contact
          </button>
          <button
            onClick={() => setFormType('bug')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-200 ${
              formType === 'bug' 
                ? 'bg-zinc-800 text-white shadow-sm' 
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Bug className="w-4 h-4" />
            Signaler un bug
          </button>
        </div>

        {/* Formulaire */}
        <form ref={formRef} action={handleSubmit} className="space-y-6">
          
          {/* Champs communs (Nom & Email) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
            <div className="flex flex-col gap-2">
              <label htmlFor="firstname" className="text-sm font-medium text-zinc-300">Prénom</label>
              <input 
                name="firstname"
                type="text" 
                id="firstname" 
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-colors"
                placeholder="Votre prénom"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="lastname" className="text-sm font-medium text-zinc-300">Nom</label>
              <input 
                name="lastname"
                type="text" 
                id="lastname" 
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-colors"
                placeholder="Votre nom de famille"
              />
            </div>
          </div>

          {/* Champ Email (maintenant commun) */}
          <div className="flex flex-col gap-2">
            <label htmlFor="email" className="text-sm font-medium text-zinc-300">Adresse Email</label>
            <input 
              name="email"
              type="email" 
              id="email" 
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-colors"
              placeholder="vous@exemple.com"
            />
          </div>

          {/* Champs spécifiques : CONTACT GÉNÉRAL */}
          {formType === 'general' && (
            <div className="flex flex-col gap-2">
  <label htmlFor="subject" className="text-sm font-medium text-zinc-300">
    Sujet de votre message
  </label>
  
  {/* Wrapper relatif indispensable pour l'icône */}
  <div className="relative">
    <select 
      name="subject" 
      id="subject" 
      required
      defaultValue="" // Force la sélection de l'option vide par défaut
      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white appearance-none pr-10 focus:outline-none focus:ring-2 focus:ring-zinc-700 transition-all"
    >
      {/* L'option par défaut, désactivée */}
      <option value="" disabled className="text-zinc-500">
        Veuillez choisir un motif de contact
      </option>
      
      {/* Tes autres options... */}
      <option value="partenariat">Proposition de partenariat / Label</option>
      <option value="support">Support technique</option>
      <option value="autre">Autre demande</option>
    </select>
    
    {/* L'icône positionnée en absolu à droite */}
    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 pointer-events-none" />
  </div>
</div>
          )}

          {/* Champs spécifiques : SIGNALEMENT DE BUG */}
          {formType === 'bug' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              
              <div className="flex flex-col gap-2">
                <label htmlFor="url" className="text-sm font-medium text-zinc-300">URL de la page concernée (Optionnel)</label>
                <input 
                  name="url"
                  type="url" 
                  id="url" 
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-colors"
                  placeholder="https://rawdio.com/..."
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-zinc-300">Capture d'écran (Optionnel)</label>
                <div className="relative w-full">
                  <input 
                    name="screenshot"
                    type="file" 
                    id="screenshot" 
                    accept="image/*"
                    className="hidden"
                  />
                  <label 
                    htmlFor="screenshot"
                    className="flex items-center justify-center gap-2 w-full bg-zinc-900/30 border border-dashed border-zinc-700 hover:border-zinc-500 rounded-xl px-4 py-6 text-zinc-400 hover:text-zinc-300 cursor-pointer transition-colors"
                  >
                    <Paperclip className="w-5 h-5" />
                    <span>Cliquez pour joindre une image (Max 5MB)</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Champ commun : Message */}
          <div className="flex flex-col gap-2">
            <label htmlFor="message" className="text-sm font-medium text-zinc-300">
              {formType === 'general' ? 'Votre message' : 'Description du problème / Étapes pour le reproduire'}
            </label>
            <textarea 
              name="message"
              id="message" 
              rows={6}
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 transition-colors resize-none"
              placeholder={formType === 'general' ? "Détaillez votre demande ici..." : "Expliquez ce qu'il s'est passé, ce que vous essayiez de faire, et le résultat obtenu..."}
            ></textarea>
          </div>

          {/* Bouton de soumission */}
          <button 
            type="submit"
            disabled={isPending}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 font-semibold rounded-xl transition-all duration-200 mt-4 disabled:opacity-70 disabled:cursor-not-allowed
              bg-white text-black hover:bg-zinc-200
            "
          >
            {isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Envoi en cours...</>
            ) : isSuccess ? (
              <><CheckCircle className="w-4 h-4" /> Message envoyé !</>
            ) : (
              <><Send className="w-4 h-4" /> Envoyer le message</>
            )}
          </button>

        </form>
      </main>
    </div>
  );
}