/** Browser TTS — French, Arabic, Kazakh & Russian via OS voices. */
import type { SpeechLang } from '@shared/types';

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

function pickVoice(voices: SpeechSynthesisVoice[], lang: string, nameHint?: string): SpeechSynthesisVoice | undefined {
  const exact = voices.find((v) => v.lang === lang);
  if (exact) return exact;
  const prefix = voices.find((v) => v.lang.startsWith(lang.split('-')[0]));
  if (prefix) return prefix;
  if (nameHint) {
    return voices.find((v) => v.name.toLowerCase().includes(nameHint));
  }
  return undefined;
}

async function speak(text: string, lang: string, nameHint?: string, rate = 0.88): Promise<boolean> {
  if (!speechSupported()) return false;
  const trimmed = text.trim();
  if (!trimmed) return false;

  speechSynthesis.cancel();
  const voices = await loadVoices();
  const utterance = new SpeechSynthesisUtterance(trimmed);
  utterance.lang = lang;
  utterance.rate = rate;
  utterance.pitch = 1;
  const voice = pickVoice(voices, lang, nameHint);
  if (voice) utterance.voice = voice;
  speechSynthesis.speak(utterance);
  return true;
}

export function speechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export async function speakFrench(text: string): Promise<boolean> {
  return speak(text, 'fr-FR', 'french', 0.9);
}

export async function speakArabic(text: string): Promise<boolean> {
  const ok = await speak(text, 'ar-SA', 'arabic', 0.82);
  if (ok) return true;
  return speak(text, 'ar', 'arabic', 0.82);
}

export async function speakKazakh(text: string): Promise<boolean> {
  const ok = await speak(text, 'kk-KZ', 'kazakh', 0.88);
  if (ok) return true;
  return speak(text, 'kk', 'kazakh', 0.88);
}

export async function speakRussian(text: string): Promise<boolean> {
  const ok = await speak(text, 'ru-RU', 'russian', 0.88);
  if (ok) return true;
  return speak(text, 'ru', 'russian', 0.88);
}

export async function speakArabicWord(arabic: string, transliteration?: string): Promise<boolean> {
  const primary = await speakArabic(arabic);
  if (primary) return true;
  if (transliteration) return speakArabic(transliteration);
  return false;
}

export function speakWord(french: string, article?: string): Promise<boolean> {
  const phrase = article ? `${article} ${french}` : french;
  return speakFrench(phrase);
}

export type { SpeechLang };

export async function speakText(text: string, lang: SpeechLang, transliteration?: string): Promise<boolean> {
  if (lang === 'ar') return speakArabicWord(text, transliteration);
  if (lang === 'kk') return speakKazakh(text);
  if (lang === 'ru') return speakRussian(text);
  return speakFrench(text);
}
