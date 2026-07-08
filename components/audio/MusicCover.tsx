"use client";

import React from 'react';

// Ce composant prend l'image générée par l'IA en prop
const MusicCover = ({ imageBase64, title, interprete }: any) => {
  
  // Note : On suppose ici que imageBase64 est la chaîne brute sans préfixe.
  // Si le format d'origine est PNG, le navigateur gère souvent bien le mismatch mime-type, 
  // mais idéalement on devrait matcher le type.
  const imageUrl = `data:image/jpeg;base64,${imageBase64}`;

  return (
    <div className="relative w-full aspect-square overflow-hidden rounded-md shadow-2xl bg-gray-900 group">
      
      {/* 1. L'IMAGE DE FOND (Générée par l'IA) */}
      <img 
        src={imageUrl} 
        alt="Cover Background" 
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />

      {/* 2. LE TEXTE (Superposé en CSS - Zéro hallucination possible) */}
      <div className="absolute inset-0 p-4 flex flex-col justify-start items-start bg-linear-to-b from-black/60 to-transparent">
        
        {/* Titre : Gros et Gras (Apple Style) */}
        <h1 className="text-white text-xl md:text-2xl font-bold tracking-tight leading-tight drop-shadow-md font-sans line-clamp-2">
          {title}
        </h1>
        
        {/* Artiste : Fin et plus petit */}
        <p className="text-white/90 text-sm md:text-base font-light mt-1 tracking-wide drop-shadow-sm font-sans truncate w-full">
          {interprete}
        </p>
        
      </div>

      {/* Petit effet de grain (Optionnel pour le look Lo-fi/Untitled) */}
      <div className="absolute inset-0 pointer-events-none opacity-10 mix-blend-overlay" 
           style={{ backgroundImage: 'url("https://grainy-gradients.vercel.app/noise.svg")' }}>
      </div>
      
    </div>
  );
};

export default MusicCover;
