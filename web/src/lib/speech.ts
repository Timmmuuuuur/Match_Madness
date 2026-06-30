/** Browser TTS — zero audio files, uses OS voices (incl. French on iOS/macOS). */

function pickFrenchVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  return (
    voices.find((v) => v.lang === 'fr-FR') ??
    voices.find((v) => v.lang.startsWith('fr')) ??
    voices.find((v) => v.name.toLowerCase().includes('french'))
  );
}

function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    const existing = speechSynthesis.getVoices();
    if (existing.length > 0) {
      resolve(existing);
      return;
    }
    const onChange = () => {
      speechSynthesis.removeEventListener('voiceschanged', onChange);
      resolve(speechSynthesis.getVoices());
    };
    speechSynthesis.addEventListener('voiceschanged', onChange);
    window.setTimeout(() => resolve(speechSynthesis.getVoices()), 400);
  });
}

export function speechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export async function speakFrench(text: string): Promise<boolean> {
  if (!speechSupported()) return false;
  const trimmed = text.trim();
  if (!trimmed) return false;

  speechSynthesis.cancel();
  const voices = await loadVoices();
  const utterance = new SpeechSynthesisUtterance(trimmed);
  utterance.lang = 'fr-FR';
  utterance.rate = 0.9;
  utterance.pitch = 1;
  const voice = pickFrenchVoice(voices);
  if (voice) utterance.voice = voice;
  speechSynthesis.speak(utterance);
  return true;
}

/** Speak full headword including article when present. */
export function speakWord(french: string, article?: string): Promise<boolean> {
  const phrase = article ? `${article} ${french}` : french;
  return speakFrench(phrase);
}
