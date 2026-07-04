import { S3Client, PutObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";

// Vérification des variables d'environnement critiques
if (!process.env.CLOUDFLARE_ENDPOINT || !process.env.CLOUDFLARE_ACCESS_KEY_ID || !process.env.CLOUDFLARE_SECRET_ACCESS_KEY || !process.env.CLOUDFLARE_BUCKET_NAME) {
  console.error("ERREUR CONFIG R2: Variables d'environnement manquantes.");
  console.error("Vérifiez: CLOUDFLARE_ENDPOINT, CLOUDFLARE_ACCESS_KEY_ID, CLOUDFLARE_SECRET_ACCESS_KEY, CLOUDFLARE_BUCKET_NAME");
}

// Initialisation du client S3 avec la configuration R2
const r2Client = new S3Client({
  region: "auto", // R2 ne demande pas de région spécifique, "auto" est recommandé
  endpoint: process.env.CLOUDFLARE_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY!,
  },
});

/**
 * Fonction pour uploader un fichier audio sur R2
 * @param fileBuffer - Le contenu du fichier (Buffer)
 * @param fileName - Le nom du fichier (ex: 'audio/mon-son.mp3')
 * @param contentType - Le type MIME (ex: 'audio/mpeg')
 */
export async function uploadAudioToR2(fileBuffer: Buffer, fileName: string, contentType: string) {
  const command = new PutObjectCommand({
    Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
    Key: fileName,
    Body: fileBuffer,
    ContentType: contentType,
    // ACL: 'public-read', // Décommente si tu veux que le fichier soit public via une URL publique R2
  });

  try {
    const response = await r2Client.send(command);
    console.log("Fichier uploadé avec succès sur R2", response);
    const domain = process.env.NEXT_PUBLIC_R2_DOMAIN || "";
    // On retourne l'URL complète
    return `${domain}/${fileName}`;
  } catch (error) {
    console.error("Erreur lors de l'upload sur R2:", error);
    // Debug pour aider à identifier le problème de config
    console.error("DEBUG R2 - Vérifiez ces valeurs :");
    console.error("- Bucket:", process.env.CLOUDFLARE_BUCKET_NAME);
    console.error("- Endpoint:", process.env.CLOUDFLARE_ENDPOINT);
    console.error("- AccessKeyId (taille):", process.env.CLOUDFLARE_ACCESS_KEY_ID?.length);
    throw error;
  }
}

export async function listFilesFromR2() {
  const command = new ListObjectsV2Command({
    Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
  });

  try {
    const response = await r2Client.send(command);
    const domain = process.env.NEXT_PUBLIC_R2_DOMAIN || "";
    
    // On retourne un format compatible avec l'ancienne logique de la page /storage
    return (response.Contents || []).map(file => {
        const key = file.Key || '';
        const url = `${domain}/${key}`;
        const isImage = key.startsWith('covers/') || !!key.match(/\.(jpg|jpeg|png|gif|webp)$/i);
        
        // Simple mime type detection from extension
        let mimeType = 'application/octet-stream';
        if (isImage) mimeType = `image/${key.split('.').pop()}`;
        else if (key.endsWith('.mp3')) mimeType = 'audio/mpeg';
        else if (key.endsWith('.wav')) mimeType = 'audio/wav';

        return {
            id: key, url, fullPath: key,
            name: key.split('/').pop() || '',
            size: file.Size || 0, date: file.LastModified || new Date(),
            category: isImage ? 'image' : 'audio', type: mimeType, error: false,
        };
    });
  } catch (error) {
    console.error("Erreur lors du listage des fichiers R2:", error);
    throw error;
  }
}

export async function deleteFileFromR2(key: string) {
  const command = new DeleteObjectCommand({
    Bucket: process.env.CLOUDFLARE_BUCKET_NAME,
    Key: key,
  });
  try {
    await r2Client.send(command);
    console.log("Fichier supprimé de R2:", key);
  } catch (error) {
    console.error("Erreur suppression R2:", error);
    throw error;
  }
}
