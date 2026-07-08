// app/actions/storage.ts
"use server";

import { getPresignedUrlForUpload, deleteFileFromR2, listFilesFromR2 } from "@/lib/cloudflare";

/**
 * Crée une URL pré-signée pour l'upload d'un fichier.
 * Le client enverra le fichier directement à cette URL.
 */
export async function getUploadUrl(fileName: string, fileType: string, folder: string = "uploads") {
  if (!fileName || !fileType) {
    throw new Error("Nom de fichier ou type manquant.");
  }

  // On préserve les caractères originaux. R2/S3 gère l'encodage.
  const key = `${folder}/${Date.now()}-${fileName}`;

  // Génération de l'URL signée
  const { signedUrl, publicUrl } = await getPresignedUrlForUpload(key, fileType);

  return { signedUrl, publicUrl };
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
