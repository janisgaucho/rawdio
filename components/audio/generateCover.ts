"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export async function generateCoverArt(data: { genre: string; bpm: string; title?: string; artist?: string }) {
  if (!apiKey) return { success: false, error: "Clé API manquante." };

  try {
    // 1. Définir l'ambiance et les couleurs avec Gemini
    const textModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    // On demande une description visuelle pure (SANS TEXTE)
    const colorPrompt = `
      Analyze this music context: Genre "${data.genre}", BPM ${data.bpm}.
      Output a 3-word visual description of a color gradient and texture (e.g. "dark crimson liquid silk", "bright neon grainy noise").
      OUTPUT: Just the description.
    `;
    const colorResult = await textModel.generateContent(colorPrompt);
    const textureDescription = colorResult.response.text().trim();

    // 2. Prompt Optimisé pour un Fond Abstrait "Apple Style"
    // On interdit explicitement le texte pour avoir un fond propre
    const finalPrompt = `
      abstract background, ${textureDescription}, 
      modern animated cover style, 
      soft gradients, high fidelity, 8k, 
      no text, no letters, no watermark, no characters.
    `.replace(/\s+/g, " ").trim();

    console.log("--- Prompt Texture ---", finalPrompt);

    // 3. Génération via Pollinations (Mode Flux pour la qualité des textures)
    const encodedPrompt = encodeURIComponent(finalPrompt);
    const pollinationUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&model=flux&nologo=true&enhance=true&seed=${Math.floor(Math.random() * 10000)}`;

    const response = await fetch(pollinationUrl, { headers: { "User-Agent": "Rawdio/1.0" } });
    if (!response.ok) throw new Error(`Erreur Pollinations: ${response.status} ${response.statusText}`);
    
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    
    return { success: true, imageBase64: base64 };

  } catch (error: any) {
    console.error("Erreur:", error);
    return { success: false, error: error.message };
  }
}