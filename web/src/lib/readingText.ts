export interface VocabEntry {
  fr: string;
  en: string;
}

export interface TextSegment {
  type: 'text' | 'vocab';
  value: string;
  en?: string;
  speak?: string;
}

const ARTICLE_PREFIX = /^(un |une |le |la |l'|les |des |d'|du |de la |au |aux |à la )/i;

/** Strip leading article for in-text matching. */
export function stripVocabArticle(fr: string): string {
  return fr.replace(ARTICLE_PREFIX, '').trim();
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

interface Term {
  pattern: string;
  speak: string;
  en: string;
  len: number;
}

function buildTerms(vocab: VocabEntry[]): Term[] {
  const seen = new Set<string>();
  const terms: Term[] = [];
  for (const v of vocab) {
    const pattern = stripVocabArticle(v.fr);
    const key = pattern.toLowerCase();
    if (pattern.length < 3 || seen.has(key)) continue;
    seen.add(key);
    terms.push({ pattern, speak: v.fr, en: v.en, len: pattern.length });
  }
  return terms.sort((a, b) => b.len - a.len);
}

/** Split French paragraph into plain text and highlighted vocabulary spans. */
export function segmentFrenchText(text: string, vocab: VocabEntry[]): TextSegment[] {
  const terms = buildTerms(vocab);
  if (!terms.length) return [{ type: 'text', value: text }];

  const segments: TextSegment[] = [];
  let i = 0;

  while (i < text.length) {
    let best: { start: number; end: number; value: string; speak: string; en: string } | null = null;

    for (const term of terms) {
      const re = new RegExp(escapeRegex(term.pattern), 'gi');
      re.lastIndex = i;
      const m = re.exec(text);
      if (!m) continue;
      if (!best || m.index < best.start) {
        best = {
          start: m.index,
          end: m.index + m[0].length,
          value: m[0],
          speak: term.speak,
          en: term.en,
        };
      }
    }

    if (!best) {
      segments.push({ type: 'text', value: text.slice(i) });
      break;
    }

    if (best.start > i) {
      segments.push({ type: 'text', value: text.slice(i, best.start) });
    }

    segments.push({
      type: 'vocab',
      value: best.value,
      speak: best.speak,
      en: best.en,
    });
    i = best.end;
  }

  return segments;
}
