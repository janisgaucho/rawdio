"use client";

import UploadZone from "@/components/library/UploadZone";
import { useAudio } from "@/components/audio/AudioContext";

export default function UploadPage() {
  const { uploadTrack } = useAudio();

  return (
    <div className="max-w-4xl mx-auto mt-8">
      <p className="text-zinc-400 mb-8 text-center">
        Les formats MP3, WAV, FLAC et AIFF sont supportés.
      </p>
      <UploadZone onFileSelect={uploadTrack} />
      <p className="text-center text-sm text-zinc-500 mt-4">
        Après l'upload, vous pourrez éditer les métadonnées comme le titre, l'artiste, le BPM et la clé depuis la page du morceau.
      </p>
      </div>
  );
}