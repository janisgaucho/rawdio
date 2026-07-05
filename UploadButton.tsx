"use client";

import { useRef } from "react";
import { useAudio } from "@/components/audio/AudioContext";
import { Upload, Loader2 } from "lucide-react";

export function UploadButton() {
  const { uploadTrack, isUploading } = useAudio();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadTrack(file);
    }
    // Réinitialiser l'input pour permettre de sélectionner le même fichier à nouveau
    if(event.target) {
        event.target.value = "";
    }
  };

  const handleUploadClick = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  return (
    <>
      <button
        onClick={handleUploadClick}
        disabled={isUploading}
        className="flex items-center gap-3 text-sm font-medium text-zinc-400 hover:text-white transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isUploading ? <Loader2 size={20} className="animate-spin" /> : <Upload size={20} />}
        <span>{isUploading ? "Upload en cours..." : "Uploader un son"}</span>
      </button>

      <input
        type="file" ref={fileInputRef} onChange={handleFileSelect}
        className="hidden" accept="audio/*"
      />
    </>
  );
}