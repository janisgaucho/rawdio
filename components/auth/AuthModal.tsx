"use client";

import { useState } from "react";
import { X, Mail, Lock, User as UserIcon, LogIn, ArrowRight } from "lucide-react";
import { useAuth } from "./AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password, username);
      }
      onClose();
    } catch (err: any) {
      console.error(err);
      setError("Erreur : Vérifiez vos identifiants ou réessayez.");
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError("Erreur lors de la connexion avec Google.");
    }
  };

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-md mx-4 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl text-white p-8" onClick={(e) => e.stopPropagation()}>
        
        <button onClick={onClose} className="absolute top-6 right-6 text-white/40 hover:text-white transition">
          <X size={20} />
        </button>

        <h2 className="text-2xl font-light mb-6 text-center">
          {isLogin ? "Connexion" : "Inscription"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Pseudo</label>
              <div className="relative">
                <UserIcon size={16} className="absolute left-4 top-3.5 text-white/30" />
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:bg-white/10 focus:outline-none transition" placeholder="Ton nom d'artiste" required />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-3.5 text-white/30" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:bg-white/10 focus:outline-none transition" placeholder="email@exemple.com" required />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-white/40 uppercase tracking-widest">Mot de passe</label>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-3.5 text-white/30" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:bg-white/10 focus:outline-none transition" placeholder="••••••••" required />
            </div>
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button type="submit" className="w-full py-3 mt-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition flex items-center justify-center gap-2">
            {isLogin ? <LogIn size={18} /> : <ArrowRight size={18} />}
            {isLogin ? "Se connecter" : "Créer un compte"}
          </button>
        </form>

        <div className="mt-4">
          <div className="relative flex py-2 items-center">
            <div className="grow border-t border-white/10"></div>
            <span className="shrink-0 mx-4 text-gray-500 text-xs uppercase">Ou</span>
            <div className="grow border-t border-white/10"></div>
          </div>

          <button 
            onClick={handleGoogleLogin}
            className="w-full py-3 mt-2 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 border border-white/10"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>Continuer avec Google</span>
          </button>
        </div>

        <div className="mt-6 text-center">
          <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-white/50 hover:text-white transition underline">
            {isLogin ? "Pas encore de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
          </button>
        </div>
      </div>
    </div>
  );
}
