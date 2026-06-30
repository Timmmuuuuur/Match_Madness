import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dictPath  = join(__dirname, 'fr-en-dict.txt');
const outDir    = join(__dirname, '..', 'shared', 'data');
const enrichPath = join(outDir, 'word-enrichments.json');

const POOL_SIZES = [500, 1000, 1500, 2000];

const enrichments = JSON.parse(readFileSync(enrichPath, 'utf8')).enrichments;

function isGameFriendly(french, english) {
  if (!french || !english) return false;
  if (french.length < 2 || english.length < 2) return false;
  if (french.toLowerCase() === english.toLowerCase()) return false;
  if (/^\d+$/.test(french) || /^\d+$/.test(english)) return false;
  if (french.length > 24 || english.length > 24) return false;
  if (/[{}[\]<>|\\]/.test(french) || /[{}[\]<>|\\]/.test(english)) return false;
  return true;
}

function pickBestTranslation(translations) {
  const unique = [...new Set(translations.map((t) => t.trim().toLowerCase()))];
  const scored = unique
    .filter((t) => t.length >= 2 && t.length <= 20 && !/^\d+$/.test(t))
    .map((t) => ({
      word: t,
      score:
        (t.includes(' ') ? -5 : 0) +
        (t.includes('-') ? -1 : 0) +
        (t.length <= 12 ? 2 : 0) +
        (translations.indexOf(t) >= 0 ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score);
  return scored[0]?.word ?? unique[0];
}

function buildPools() {
  const lines = readFileSync(dictPath, 'utf8').split('\n').filter(Boolean);
  const byFrench = new Map();

  for (const line of lines) {
    const space = line.indexOf(' ');
    if (space === -1) continue;
    const french  = line.slice(0, space).trim();
    const english = line.slice(space + 1).trim();
    if (!byFrench.has(french)) byFrench.set(french, []);
    byFrench.get(french).push(english);
  }

  const pairs = [];
  for (const [french, translations] of byFrench) {
    const english = pickBestTranslation(translations);
    if (!isGameFriendly(french, english)) continue;
    const key = french.toLowerCase();
    const enrich = enrichments[key] ?? {};
    const word = {
      id: pairs.length + 1,
      french: key,
      english: english.toLowerCase(),
    };
    if (enrich.article)  word.article  = enrich.article;
    if (enrich.context)  word.context  = enrich.context;
    pairs.push(word);
    if (pairs.length >= 2000) break;
  }

  mkdirSync(outDir, { recursive: true });

  for (const size of POOL_SIZES) {
    const pool = pairs.slice(0, size);
    const outPath = join(outDir, `words-${size}.json`);
    writeFileSync(
      outPath,
      JSON.stringify(
        {
          meta: { size: pool.length, targetSize: size, languagePair: 'en-fr', source: 'fr-en frequency dictionary (ARRIVAL)' },
          words: pool,
        },
        null,
        2,
      ),
    );
    console.log(`Wrote ${pool.length} words -> ${outPath}`);
  }
}

buildPools();
