// app/actions/storage.ts
"use server";

import { uploadAudioToR2, deleteFileFromR2, listFilesFromR2 } from "@/lib/cloudflare";

/**
 * Upload un fichier vers R2 via une Server Action
 */
export async function uploadFile(formData: FormData, folder: string = "uploads") {
  const file = formData.get("file") as File;
  
  if (!file) {
    throw new Error("Aucun fichier fourni");
  }

  // Conversion du fichier en Buffer pour le SDK AWS
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  // Nettoyage du nom de fichier
  // On ne "nettoie" plus le nom pour préserver les caractères originaux comme les espaces et accents. R2/S3 gère l'encodage.
  const fileName = `${folder}/${Date.now()}-${file.name}`;

  // Upload
  const url = await uploadAudioToR2(buffer, fileName, file.type);
  
  return url;
}

/**
 * Supprime un fichier de R2
 */
export async function deleteFile(fileUrl: string) {
  if (!fileUrl) return;

  // Extraction de la clé (chemin) depuis l'URL complète
  // Ex: https://mon-domaine.com/uploads/fichier.mp3 -> uploads/fichier.mp3
  const domain = process.env.NEXT_PUBLIC_R2_DOMAIN || "";
  
  // SÉCURITÉ : On vérifie si l'URL appartient bien à notre bucket R2
  if (!fileUrl.startsWith(domain)) {
    console.warn("Suppression ignorée : L'URL ne provient pas de ce bucket R2", fileUrl);
    return;
  }

  // On retire le domaine et le slash initial éventuel pour obtenir la clé S3
  const key = fileUrl.replace(domain, "").replace(/^\//, "");
  await deleteFileFromR2(key);
}

/**
 * Wrapper pour lister les fichiers depuis R2 via une Server Action.
 */
export async function listFiles() {
  return await listFilesFromR2();
}
