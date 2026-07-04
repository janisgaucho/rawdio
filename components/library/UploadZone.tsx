"use client";

import { useState, useRef } from "react";
import { UploadCloud, Loader2 } from "lucide-react"; // Ajout de Loader2
import { useAudio } from "@/components/audio/AudioContext";

export default function UploadZone({ onFileSelect }: { onFileSelect?: (file: File) => void }) {
  const { uploadTrack, isUploading } = useAudio(); // On récupère l'état d'upload
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!isUploading) setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (isUploading) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) handleFiles(files);
  };

  const handleFiles = async (files: FileList) => {
    const file = files[0];
    if (file.type.startsWith("audio/")) {
      if (onFileSelect) {
        onFileSelect(file); // Si une fonction est fournie, on l'utilise (Page Upload)
      } else {
        await uploadTrack(file); // Sinon comportement par défaut (Modale)
      }
    } else {
      alert("Fichier audio uniquement !");
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !isUploading && fileInputRef.current?.click()}
      className={`
        w-full h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all mb-8
        ${isDragging ? "border-white bg-[#1a1a1a]" : "border-[#262626] hover:border-gray-500 hover:bg-[#0f0f0f]"}
        ${isUploading ? "cursor-wait opacity-50" : "cursor-pointer"}
      `}
    >
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="audio/*" 
        onChange={(e) => e.target.files && handleFiles(e.target.files)}
        disabled={isUploading}
      />
      
      {isUploading ? (
        <div className="flex flex-col items-center animate-pulse">
          <Loader2 size={32} className="text-white animate-spin mb-2" />
          <p className="text-sm text-gray-400">Envoi vers le Cloud...</p>
        </div>
      ) : (
        <>
          <UploadCloud size={32} className={isDragging ? "text-white" : "text-gray-500"} />
          <p className="mt-2 text-sm text-gray-400 font-medium">
            {isDragging ? "Lâche le fichier !" : "Glisse un MP3 pour le stocker en ligne"}
          </p>
        </>
      )}
    </div>
  );
}