import React from 'react';
import Image from 'next/image';
import { Music, Cloud, Sparkles, ArrowRight, Shield, MessageSquare, GitBranch, AudioLines, LibraryBig } from 'lucide-react';
import Footer from './Footer';
import AnimatedSection from './AnimatedSection';

interface LandingPageProps {
  onAuthClick?: () => void; // Optionnel : fonction pour ouvrir ta modal de connexion si existante
}

export default function LandingPage({ onAuthClick }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0c] text-zinc-100 font-sans selection:bg-zinc-800 selection:text-white overflow-x-hidden">
      
      {/* Barre de navigation */}
      <header className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center border-b border-zinc-900 shrink-0">
        <div className="shrink-0">
          <Image
            src="/logo.png"
            alt="Rawdio Logo"
            width={200}
            height={80}
            className="h-12 md:h-16 w-auto object-contain"
          />
        </div>
        <button 
          onClick={onAuthClick}
          className="px-5 py-2.5 text-sm font-semibold bg-white text-black rounded-lg transition-colors hover:bg-zinc-200"
        >
          Se connecter
        </button>
      </header>

      {/* Section principale / Hero */}
      <main className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto w-full min-h-[calc(100vh-100px)]">
            <AnimatedSection>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-400 mb-6 backdrop-blur-sm">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Version bêta. Vos retours sont les bienvenus.
            </div>
          </AnimatedSection>
          
          <AnimatedSection delay={100}>
            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-6 leading-[1.1]">
              Le partage de musique, <br/>
              <span className="text-transparent bg-clip-text bg-linear-to-r from-zinc-200 via-zinc-400 to-zinc-500">
                à l'état brut.
              </span>
            </h1>
          </AnimatedSection>
          
          <AnimatedSection delay={200}>
            <p className="text-zinc-400 text-lg md:text-xl mb-10 max-w-2xl leading-relaxed">
              L'espace de travail haute fidélité de l'industrie musicale. Hébergez vos bounces sans perte, centralisez les retours sur vos mix, et connectez beatmakers, artistes et équipes de label autour du vrai son.
            </p>
          </AnimatedSection>
          
          <AnimatedSection delay={300}>
            <button 
              onClick={onAuthClick}
              className="group inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-zinc-200 text-black font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-white/5 text-base"
            >
              Commencer l'expérience
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </AnimatedSection>
        </div>

        {/* Grille de fonctionnalités (Style Bento Grid) */}
        <AnimatedSection className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          
          {/* Carte 1: Streaming non compressé */}
          <div className="md:col-span-2 p-8 rounded-2xl bg-zinc-900/30 border border-zinc-900 flex flex-col justify-between min-h-60 hover:border-zinc-800 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white">
              <Music className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Streaming sans perte</h3>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-md">
                Écoutez vos exports WAV ou MP3 directement dans leur qualité d'origine. Aucun algorithme destructeur ne vient altérer vos mixages ou vos dynamiques.
              </p>
            </div>
          </div>

          {/* Carte 2: Infrastructure R2 */}
          <div className="p-8 rounded-2xl bg-zinc-900/30 border border-zinc-900 flex flex-col justify-between min-h-60 hover:border-zinc-800 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Cloud haute vitesse</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Uploadez vos dossiers de stems massifs et vos masters 24-bit en quelques secondes.
              </p>
            </div>
          </div>

          {/* Carte 3: Covers Assistées par IA */}
          <div className="p-8 rounded-2xl bg-zinc-900/30 border border-zinc-900 flex flex-col justify-between min-h-60 hover:border-zinc-800 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Intégration IA</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Générez des cover uniques, trouvez le BPM ou la gamme de votre morceau grâce à nos outils IA.
              </p>
            </div>
          </div>

          {/* Carte 4: Stockage Privé */}
          <div className="md:col-span-2 p-8 rounded-2xl bg-zinc-900/30 border border-zinc-900 flex flex-col justify-between min-h-60 hover:border-zinc-800 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Sécurité et confidentialité</h3>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-md">
                Protégez le fruit de vos sessions. Chaque utilisateur dispose d'un espace fermé et sécurisé. Sécurisez vos masters et choisissez précisément qui peut écouter ou télécharger vos projets.
              </p>
            </div>
          </div>

        </AnimatedSection>
      </main>

      {/* Titre de transition */}
        <AnimatedSection className="mt-32 mb-16 flex flex-col items-center text-center max-w-3xl mx-auto px-6">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Ne partagez plus vos maquettes. <br className="hidden md:block"/>
            <span className="text-zinc-500">Collaborez dessus.</span>
          </h2>
          <p className="text-zinc-400 text-lg leading-relaxed">
            Découvrez un espace de travail pensé pour accélérer vos validations et fluidifier les échanges entre le studio, les artistes et le label.
          </p>
        </AnimatedSection>

      {/* Section Showcase */}
      <div className="max-w-5xl mx-auto px-6 py-16 md:py-24 space-y-24">
        {/* Bloc 1: Lecteur & Commentaires */}
        <AnimatedSection className="grid md:grid-cols-2 gap-12 items-center">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 mb-4">
              <MessageSquare className="w-3 h-3 text-blue-400" />
              Collaboration
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Feedback précis et horodaté</h2>
            <p className="text-zinc-400 leading-relaxed">
              Visualisez chaque détail de votre piste avec notre lecteur d'onde minimaliste. Laissez des commentaires horodatés pour un feedback ciblé et efficace, directement sur la timeline.
            </p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 backdrop-blur-md rounded-2xl aspect-video overflow-hidden shadow-lg">
            <Image
              src="/showcase/versions.png"
              alt="Capture d'écran du lecteur audio de Rawdio"
              width={1280}
              height={720}
              className="w-full h-full object-cover"
            />
          </div>
        </AnimatedSection>

        {/* Bloc 2: Versioning */}
        <AnimatedSection className="grid md:grid-cols-2 gap-12 items-center" delay={150}>
          <div className="bg-zinc-900/50 border border-zinc-800 backdrop-blur-md rounded-2xl aspect-video overflow-hidden shadow-lg md:order-first order-last">
            <Image
              src="/showcase/lecteur.png"
              alt="Capture d'écran du système de gestion de versions de Rawdio"
              width={1280}
              height={720}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-center md:text-left md:order-last order-first">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 mb-4">
              <AudioLines className="w-3 h-3 text-purple-400" />
              Qualité du son
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Lecteur haute fidélité</h2>
            <p className="text-zinc-400 leading-relaxed">
              Écoutez vos productions dans leur définition originale. Le lecteur Rawdio est conçu pour restituer chaque détail de votre mix.
            </p>
          </div>
        </AnimatedSection>

        <AnimatedSection className="grid md:grid-cols-2 gap-12 items-center">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 mb-4">
              <LibraryBig className="w-3 h-3 text-blue-400" />
              Hub musical
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Votre centre de contrôle</h2>
            <p className="text-zinc-400 leading-relaxed">
              Un menu intuitif pour naviguer entre vos productions et les espaces de collaboration.
            </p>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 backdrop-blur-md rounded-2xl aspect-video overflow-hidden shadow-lg">
            <Image
              src="/showcase/menu.png"
              alt="Capture d'écran du lecteur audio de Rawdio"
              width={1280}
              height={720}
              className="w-full h-full object-cover"
            />
          </div>
        </AnimatedSection>
      </div>

      <Footer />
    </div>
  );
}