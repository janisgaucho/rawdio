// lib/audioAnalysis.ts

// Ce fichier contient des utilitaires lourds pour l'analyse audio.
// Ils sont isolés ici pour améliorer le bundling et la clarté du code.

export const formatDuration = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return "00:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
};

export const detectBpmFromFile = async (file: File): Promise<string | null> => {
  try {
    if (typeof window === 'undefined') return null;

    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const context = new AudioContext();
    
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await context.decodeAudioData(arrayBuffer);
    
    const bpm = analyzeBpm(audioBuffer);
    
    if (context.state !== 'closed') await context.close();
    
    return bpm ? Math.round(bpm).toString() : null;
  } catch (error) {
    console.error("Erreur détection BPM:", error);
    return null;
  }
};

export const analyzeAudioFile = async (file: File): Promise<{ duration: string; bpm: string; key: string; bitrate: number; sampleRate: number }> => {
  // 1. Regex Fallback (pour la clé et le BPM si l'analyse échoue)
  const titleLower = file.name.toLowerCase();
  const bpmMatch = titleLower.match(/\b(6[0-9]|[7-9][0-9]|1[0-9]{2}|200)\b/);
  const keyMatch = titleLower.match(/\b([a-g][#b]?)\s*(maj|min|m)\b/i);

  let detectedBpm = bpmMatch ? bpmMatch[0] : "";
  let detectedKey = "";
 
  if (keyMatch) {
      const note = keyMatch[1].charAt(0).toUpperCase() + keyMatch[1].slice(1);
      const modeStr = keyMatch[2].toLowerCase();
      detectedKey = (modeStr === 'maj') ? `${note}M` : `${note}m`;
  }

  let realDuration = "00:00";
  let bitrate = 0;
  let sampleRate = 0;

  try {
    // 2. Analyse Audio Avancée (Web Audio API)
    if (typeof window !== 'undefined') {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const context = new AudioContext({ sampleRate: 44100 });
       
        const arrayBuffer = await file.arrayBuffer();
        const audioBuffer = await context.decodeAudioData(arrayBuffer);
       
        realDuration = formatDuration(audioBuffer.duration);
        sampleRate = audioBuffer.sampleRate;

        if (audioBuffer.duration > 0) {
            // Estimation du bitrate en kbps
            bitrate = Math.round((file.size * 8) / audioBuffer.duration / 1000);
        }

        if (context.state !== 'closed') await context.close();
    }
  } catch (error) {
      console.error("Erreur analyse audio:", error);
      // En cas d'erreur (ex: fichier corrompu), on garde les valeurs par défaut/regex
  }

  return { duration: realDuration, bpm: detectedBpm, key: detectedKey, bitrate, sampleRate };
};

// Algorithme simple de détection de BPM (Peak Detection + Interval Histogram)
function analyzeBpm(buffer: AudioBuffer): number | null {
  const data = buffer.getChannelData(0);
  const sampleRate = buffer.sampleRate;
  
  // 0. Calculer le volume max global pour un seuil dynamique
  let globalMax = 0;
  for (let i = 0; i < data.length; i++) {
    if (Math.abs(data[i]) > globalMax) globalMax = Math.abs(data[i]);
  }
  if (globalMax < 0.1) return null; // Trop silencieux
  const threshold = globalMax * 0.3;

  // 1. Identifier les pics de volume (Peaks)
  // On découpe en segments de 0.1s pour trouver les pics locaux
  const segmentSize = Math.floor(sampleRate / 10);
  const peaks: { pos: number, vol: number }[] = [];
  
  for (let i = 0; i < data.length; i += segmentSize) {
    let maxVol = 0;
    let maxPos = 0;
    for (let j = 0; j < segmentSize && (i + j) < data.length; j++) {
      const vol = Math.abs(data[i + j]);
      if (vol > maxVol) {
        maxVol = vol;
        maxPos = i + j;
      }
    }
    if (maxVol > threshold) { // Seuil dynamique
      peaks.push({ pos: maxPos, vol: maxVol });
    }
  }

  if (peaks.length < 10) return null;

  // 2. Calculer les intervalles entre les pics voisins
  const intervals: number[] = [];
  for (let i = 0; i < peaks.length; i++) {
    for (let j = i + 1; j < Math.min(i + 10, peaks.length); j++) {
      const dist = peaks[j].pos - peaks[i].pos;
      const time = dist / sampleRate;
      if (time > 0) {
        let bpm = 60 / time;
        // Normalisation (70-180 BPM)
        while (bpm < 70) bpm *= 2;
        while (bpm > 180) bpm /= 2;
        intervals.push(bpm);
      }
    }
  }

  // 3. Histogramme pour trouver le BPM le plus fréquent
  const histogram: Record<number, number> = {};
  intervals.forEach(bpm => {
    const rounded = Math.round(bpm);
    histogram[rounded] = (histogram[rounded] || 0) + 1;
  });

  let bestBpm = 0;
  let maxCount = 0;
  
  Object.entries(histogram).forEach(([bpmStr, count]) => {
    const bpm = parseInt(bpmStr);
    // Lissage avec les voisins
    const weightedCount = (histogram[bpm-1] || 0) + count + (histogram[bpm+1] || 0);
    if (weightedCount > maxCount) {
      maxCount = weightedCount;
      bestBpm = bpm;
    }
  });

  return bestBpm > 0 ? bestBpm : null;
}