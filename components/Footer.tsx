import React from 'react';
import Link from 'next/link';
import { Instagram, Linkedin, Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="max-w-7xl mx-auto px-6 py-8 mt-16 border-t border-zinc-900">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
        <p className="text-zinc-500 text-sm flex items-center gap-1">
          © {new Date().getFullYear()} <a href="https://www.janisbotella.com" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300 transition-colors">Janis Botella</a>. Tous droits réservés.
        </p>
        <div className="flex items-center gap-6 text-zinc-500">
          <Link href="/legal" className="hover:text-zinc-300 transition-colors text-sm">Mentions légales</Link>
          <Link href="/contact" className="hover:text-zinc-300 transition-colors text-sm">Contact</Link>
          <a href="https://www.instagram.com/janisbotella" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300 transition-colors"><Instagram size={18} /></a>
          <a href="https://www.linkedin.com/in/janisbotella" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300 transition-colors"><Linkedin size={18} /></a>
          <a href="https://github.com/janisgaucho" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300 transition-colors"><Github size={18} /></a>
        </div>
      </div>
    </footer>
  );
}