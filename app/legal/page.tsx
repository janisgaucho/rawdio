import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Linkedin, Github } from 'lucide-react';
import Footer from '@/components/Footer';
 
export default function LegalPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0c] text-zinc-100 font-sans">
      
      {/* Barre de navigation (identique à la Landing Page) */}
      <header className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center border-b border-zinc-900">
        <div className="flex-shrink-0">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Rawdio Logo"
              width={200}
              height={80}
              className="h-12 md:h-16 w-auto object-contain"
            />
          </Link>
        </div>
        <Link href="/" className="px-5 py-2.5 text-sm font-semibold bg-white text-black rounded-lg transition-colors hover:bg-zinc-200">
          Se connecter
        </Link>
      </header>
        
      <div className="max-w-3xl mx-auto px-6 py-12 md:py-16">
        <main id="mentions-legales" className="text-zinc-400">
          <h1 className="text-3xl font-bold text-white mb-8 text-center">Mentions légales</h1>
          
          <div className="space-y-8 text-sm leading-relaxed">
            <div>
              <h2 className="text-lg font-semibold text-white mb-2">1. Éditeur du site</h2>
              <p>
                Le site web Rawdio est édité à titre personnel par :<br/>
                Janis Botella<br/>
                Email : botellajvnis@gmail.com
              </p>
              <p className="mt-2 text-xs text-zinc-500">
                Le présent site est édité à titre non professionnel au sens de l'article 6, III, 2° de la loi 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique (LCEN). L'éditeur a fait le choix de conserver l'anonymat de son adresse postale. Ses coordonnées exactes ont été transmises à l'hébergeur de manière valide.
              </p>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white mb-2">2. Hébergement</h2>
              <p>
                L'hébergement du site est assuré par la société :<br/>
                Vercel Inc.<br/>
                Adresse : 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis<br/>
                Site web : https://vercel.com<br/>
                Contact : privacy@vercel.com
              </p>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white mb-2">3. Propriété intellectuelle</h2>
              <p>La structure générale du site, ainsi que les textes, graphiques, images, sons et vidéos la composant, sont la propriété de l'éditeur ou de ses partenaires. Toute représentation, reproduction, ou exploitation partielle ou totale des contenus et services proposés par le site Rawdio, par quelque procédé que ce soit, sans l'autorisation préalable et par écrit de Janis Botella est strictement interdite et serait susceptible de constituer une contrefaçon au sens des articles L. 335-2 et suivants du Code de la propriété intellectuelle.</p>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white mb-2">4. Données personnelles et confidentialité</h2>
              <p>Le site Rawdio s'engage à ce que la collecte et le traitement de vos données, effectués à partir du site, soient conformes au règlement général sur la protection des données (RGPD) et à la loi Informatique et Libertés. Les données stockées (fichiers audio, commentaires, profils) le sont dans un cadre strictement privé et sécurisé. Pour toute information ou exercice de vos droits Informatique et Libertés (droit d'accès, de rectification ou de suppression) sur les traitements de données personnelles gérés par Rawdio, vous pouvez contacter l'éditeur via l'adresse email mentionnée plus haut.</p>
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}