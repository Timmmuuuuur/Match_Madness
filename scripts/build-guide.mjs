/**
 * Parses standalone/guide-content.md into structured JSON for the web app.
 * Run: node scripts/build-guide.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const MD = readFileSync(join(ROOT, 'standalone/guide-content.md'), 'utf8');

function parseInline(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>');
}

function calloutVariant(line) {
  if (line.includes('🇬🇧')) return 'compare-en';
  if (line.includes('🇷🇺')) return 'compare-ru';
  if (/strategy|tip|remember|mnemonic|key habit/i.test(line)) return 'tip';
  if (/warning|caution|careful|don't|avoid/i.test(line)) return 'warning';
  return 'note';
}

function parseTable(lines, startIdx) {
  const rows = [];
  let i = startIdx;
  while (i < lines.length && lines[i].trim().startsWith('|')) {
    const cells = lines[i]
      .split('|')
      .slice(1, -1)
      .map((c) => c.trim());
    if (!cells.every((c) => /^[-:]+$/.test(c))) {
      rows.push(cells.map(parseInline));
    }
    i++;
  }
  if (rows.length < 2) return { block: null, next: startIdx };
  const [headers, ...body] = rows;
  return {
    block: { type: 'table', headers, rows: body },
    next: i,
  };
}

function parseBlocks(content) {
  const lines = content.split('\n');
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed || trimmed === '---') {
      i++;
      continue;
    }

    if (trimmed.startsWith('### ')) {
      blocks.push({ type: 'heading', level: 3, text: trimmed.slice(4) });
      i++;
      continue;
    }

    if (trimmed.startsWith('## ')) {
      blocks.push({ type: 'heading', level: 2, text: trimmed.slice(3) });
      i++;
      continue;
    }

    if (trimmed.startsWith('|')) {
      const { block, next } = parseTable(lines, i);
      if (block) {
        blocks.push(block);
        i = next;
        continue;
      }
    }

    if (trimmed.startsWith('>')) {
      const quoteLines = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      const text = parseInline(quoteLines.join(' '));
      blocks.push({ type: 'callout', variant: calloutVariant(text), text });
      continue;
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const items = [];
      while (i < lines.length && /^[-*]\s/.test(lines[i].trim())) {
        items.push(parseInline(lines[i].trim().replace(/^[-*]\s/, '')));
        i++;
      }
      blocks.push({ type: 'list', items });
      continue;
    }

    const paraLines = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].trim().startsWith('#') &&
      !lines[i].trim().startsWith('|') &&
      !lines[i].trim().startsWith('>') &&
      !/^[-*]\s/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i].trim());
      i++;
    }
    if (paraLines.length) {
      blocks.push({ type: 'paragraph', text: parseInline(paraLines.join(' ')) });
    } else {
      i++;
    }
  }

  return blocks;
}

function splitSections(md, startSection = 1, endSection = 20) {
  const sectionRegex = /^## (\d+)\.\s+(.+)$/gm;
  const matches = [...md.matchAll(sectionRegex)];
  const sections = [];

  for (let s = 0; s < matches.length; s++) {
    const num = parseInt(matches[s][1], 10);
    if (num < startSection || num > endSection) continue;

    const title = matches[s][2].replace(/\s*\{#.+\}\s*$/, '').trim();
    const start = matches[s].index + matches[s][0].length;
    const end = matches[s + 1]?.index ?? md.length;
    const body = md.slice(start, end).trim();
    const id = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Pronunciation: split single long section into ### subsections for navigation
    if (num === 1 && startSection === 1 && endSection === 1) {
      const h3Regex = /^### (.+)$/gm;
      const h3Matches = [...body.matchAll(h3Regex)];
      if (h3Matches.length > 1) {
        for (let h = 0; h < h3Matches.length; h++) {
          const subTitle = h3Matches[h][1].trim();
          const subStart = h3Matches[h].index + h3Matches[h][0].length;
          const subEnd = h3Matches[h + 1]?.index ?? body.length;
          const subBody = body.slice(subStart, subEnd).trim();
          const subId = subTitle
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
          sections.push({
            id: subId,
            number: h + 1,
            title: subTitle,
            blocks: parseBlocks(subBody),
          });
        }
        continue;
      }
    }

    sections.push({
      id,
      number: num,
      title,
      blocks: parseBlocks(body),
    });
  }

  return sections;
}

const pronunciation = {
  meta: {
    title: 'Pronunciation',
    subtitle: 'Vowels, nasals, the French R, silent letters, liaison, elision, and accents — read anything aloud with confidence.',
    accent: 'purple',
  },
  sections: splitSections(MD, 1, 1),
};

const grammar = {
  meta: {
    title: 'Grammar',
    subtitle: 'Gender, articles, verbs, tenses, negation, questions, pronouns, and register — with English and Russian comparison notes where they help.',
    accent: 'amber',
  },
  sections: splitSections(MD, 2, 20),
};

const outDir = join(ROOT, 'shared/data');
writeFileSync(join(outDir, 'guide-pronunciation.json'), JSON.stringify(pronunciation, null, 2));
writeFileSync(join(outDir, 'guide-grammar.json'), JSON.stringify(grammar, null, 2));

console.log(`Pronunciation: ${pronunciation.sections.length} sections`);
console.log(`Grammar: ${grammar.sections.length} sections`);
