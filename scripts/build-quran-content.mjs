/**
 * Builds expanded Quran learning data:
 *   shared/data/quran/vocab.json
 *   shared/data/quran/sentences.json
 *   shared/data/quran/word-practice.json
 *
 * Run: node scripts/build-quran-content.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const QURAN_DIR = join(__dirname, '../shared/data/quran');

const letters = JSON.parse(readFileSync(join(QURAN_DIR, 'letters.json'), 'utf8'));
const harakat = JSON.parse(readFileSync(join(QURAN_DIR, 'harakat.json'), 'utf8'));

function classifyLength(arabic) {
  const stripped = arabic.replace(/[\s\u064B-\u065F\u0670\u06D6-\u06ED]/g, '');
  if (stripped.length <= 4) return 'short';
  if (stripped.length <= 10) return 'medium';
  return 'long';
}

function w(arabic, transliteration, english, opts = {}) {
  return {
    arabic,
    transliteration,
    english,
    length: opts.length ?? classifyLength(arabic),
    rules: opts.rules ?? [],
    ruleNote: opts.ruleNote ?? '',
    examples: opts.examples ?? [],
    context: opts.context ?? transliteration,
  };
}

let nextId = 9000;

function assignIds(words) {
  return words.map((word) => ({ ...word, id: ++nextId }));
}

// ── Letter names (foundation) ──
const letterWords = letters.letters.map((l) =>
  w(l.isolated, l.transliteration, `letter ${l.name}`, {
    rules: ['letter-form', l.example ? 'harakat-on-letter' : 'isolated-letter'],
    ruleNote: `${l.name} (${l.transliteration}) — ${l.sound}. Example with fatha: ${l.example || l.isolated + 'َ'}`,
    examples: l.example ? [{ arabic: l.example, transliteration: `${l.transliteration}a`, english: `${l.transliteration} + short a` }] : [],
    context: l.name,
  }),
);

// ── Harakat practice words ──
const harakatWords = harakat.marks.map((m) =>
  w(m.example, m.transliteration, m.english, {
    rules: [`harakat:${m.id}`, 'consonant-vowel'],
    ruleNote: `${m.name} (${m.symbol}) gives ${m.sound}. Read ${m.example} as "${m.transliteration}".`,
    length: 'short',
    context: m.name,
  }),
);

const VOCAB_CATEGORIES = [
  {
    id: 'alphabet',
    label: 'Alphabet & letter forms',
    words: letterWords,
  },
  {
    id: 'harakat-practice',
    label: 'Harakat in practice',
    words: harakatWords,
  },
  {
    id: 'allah-worship',
    label: 'Allah & worship',
    words: [
      w('اللَّه', 'Allāh', 'Allah', { rules: ['shadda', 'lam-tafkhim'], ruleNote: 'Lām in Allāh is heavy after fatḥa; shadda on lām in some scripts.' }),
      w('رَبّ', 'Rabb', 'Lord / Sustainer', { rules: ['fatha', 'shadda'], ruleNote: 'Fatḥa on rā, then doubled bā (shadda) — hold the b briefly.' }),
      w('رَحْمَٰن', 'Raḥmān', 'Most Merciful', { rules: ['fatha', 'sukun', 'alif-khanjariyya'], ruleNote: 'ḥ with sukūn, m with fatḥa, dagger alif lengthens ā before nūn.' }),
      w('رَحِيم', 'Raḥīm', 'Especially Merciful', { rules: ['kasra', 'long-ya'], ruleNote: 'Kasra on ḥā, long ī from yā (two counts).' }),
      w('مَالِك', 'Mālik', 'Master / Owner', { rules: ['fatha', 'kasra', 'long-alif'], ruleNote: 'Māl- with long ā, -ik with kasra on kāf.' }),
      w('عَبْد', 'ʿabd', 'servant', { rules: ['ayn', 'sukun', 'fatha'], ruleNote: 'ʿayn then b with sukūn — stop cleanly on b.' }),
      w('صَلَاة', 'ṣalāh', 'prayer', { rules: ['emphatic-sad', 'long-alif', 'tā-marbuta'], ruleNote: 'Ṣād is emphatic; tā marbūṭa at end = ah in pause.' }),
      w('زَكَاة', 'zakāh', 'obligatory charity', { rules: ['fatha', 'long-alif'], ruleNote: 'Za-kaa — long ā before h at pause.' }),
      w('جَنَّة', 'jannah', 'Paradise', { rules: ['fatha', 'shadda', 'tā-marbuta'], ruleNote: 'Shadda doubles nūn: jan-na.' }),
      w('نَار', 'nār', 'Fire', { rules: ['fatha', 'long-alif'], ruleNote: 'Short na + long ār.' }),
      w('إِلَٰه', 'ilāh', 'deity / god', { rules: ['hamza-wasl', 'kasra', 'long-alif'], ruleNote: 'Hamza under alif with kasra when not after waṣl; ā lengthened.' }),
      w('دِين', 'dīn', 'religion / recompense', { rules: ['kasra', 'long-ya'], ruleNote: 'Dīn — long ī from yā.' }),
      w('آمِين', 'āmīn', 'O Allah accept', { rules: ['madd-alif', 'kasra', 'long-ya'], ruleNote: 'Madd on alif (ā), mīn with kasra + long ī.' }),
    ],
  },
  {
    id: 'fatiha-openers',
    label: 'Al-Fatiha & openers',
    words: [
      w('بِسْمِ', 'bismi', 'in the name of', { rules: ['kasra', 'sukun'], ruleNote: 'Bi-sm — kasra on bā, m with sukūn.' }),
      w('الْحَمْدُ', 'al-ḥamdu', 'all praise', { rules: ['sun-letter', 'sukun', 'damma'], ruleNote: 'Lām assimilates into ḥā (sun letter); damma on dāl.' }),
      w('الْعَالَمِينَ', 'al-ʿālamīn', 'the worlds', { rules: ['moon-letter', 'long-alif', 'kasra-plural'], ruleNote: 'ʿayn is moon letter — clear lām; ā then īn ending.' }),
      w('يَوْمِ', 'yawm', 'day', { rules: ['fatha', 'sukun'], ruleNote: 'Ya-wm — wāw carries sukūn.' }),
      w('نَعْبُدُ', 'naʿbudu', 'we worship', { rules: ['fatha', 'damma', 'ʿayn'], ruleNote: 'Naʿ-bu-du — ʿayn in middle, damma on bā.' }),
      w('نَسْتَعِين', 'nastaʿīn', 'we seek help', { rules: ['sukun', 'kasra', 'long-ya'], ruleNote: 'Nas-ta-ʿīn — long ī at end.' }),
      w('الصِّرَاط', 'aṣ-ṣirāṭ', 'the path', { rules: ['sun-letter', 'shadda', 'kasra', 'long-alif'], ruleNote: 'Ṣād is sun letter — lām merges; shadda on ṣād.' }),
      w('الْمُسْتَقِيم', 'al-mustaqīm', 'the straight', { rules: ['kasra', 'sukun', 'long-ya'], ruleNote: 'Mus-ta-qīm — qāf then long īm.' }),
      w('أَنْعَمْ', 'anʿamta', 'You have blessed', { rules: ['hamza', 'sukun', 'shadda'], ruleNote: 'An-ʿam — hamza with fatḥa, ʿayn with fatḥa.' }),
      w('الضَّالِّين', 'aḍ-ḍāllīn', 'those astray', { rules: ['sun-letter', 'shadda', 'long-alif'], ruleNote: 'Ḍād is sun letter; shadda doubles ḍād.' }),
    ],
  },
  {
    id: 'common-verbs',
    label: 'Common Quranic verbs',
    words: [
      w('قَالَ', 'qāla', 'he said', { rules: ['fatha', 'long-alif', 'fatha-pause'], ruleNote: 'Qā-la — qāf from deep throat, long ā.' }),
      w('كَانَ', 'kāna', 'he was', { rules: ['fatha', 'long-alif'], ruleNote: 'Kā-na — standard past tense pattern.' }),
      w('جَاءَ', 'jā\'a', 'he came', { rules: ['fatha', 'hamza-madd'], ruleNote: 'Jā\'a — madd on alif before hamza.' }),
      w('عَلِمَ', 'ʿalima', 'he knew', { rules: ['fatha', 'kasra'], ruleNote: 'ʿa-li-ma — kasra on lām.' }),
      w('آمَنَ', 'āmana', 'he believed', { rules: ['madd-alif', 'fatha'], ruleNote: 'Ā-ma-na — madd alif at start.' }),
      w('اتَّقَى', 'ittaqā', 'he was mindful', { rules: ['idgham', 'fatha', 'long-alif'], ruleNote: 'Tā merges with tā (shadda) in written form اتّقى.' }),
      w('أَنزَلَ', 'anzala', 'He sent down', { rules: ['hamza', 'sukun', 'fatha'], ruleNote: 'An-za-la — nūn sukūn before zāy.' }),
      w('خَلَقَ', 'khalaqa', 'He created', { rules: ['fatha', 'qalqalah'], ruleNote: 'Kha-la-qa — light qalqalah on qāf with sukūn at stop.' }),
      w('هَدَى', 'hadā', 'He guided', { rules: ['fatha', 'long-alif'], ruleNote: 'Ha-dā — long ā on alif.' }),
      w('يَتَذَكَّرُ', 'yatadhakkaru', 'he remembers', { rules: ['fatha', 'shadda', 'damma'], ruleNote: 'Ya-ta-dhak-ka-ru — shadda on kāf.' }),
      w('يَعْلَمُ', 'yaʿlamu', 'He knows', { rules: ['fatha', 'sukun', 'damma'], ruleNote: 'Yaʿ-lamu — ʿayn with sukūn.' }),
      w('يَخْلُقُ', 'yakhluqu', 'He creates', { rules: ['fatha', 'sukun', 'damma'], ruleNote: 'Yakh-lu-qu — khā with sukūn.' }),
      w('أَرْسَلَ', 'arsala', 'He sent', { rules: ['fatha', 'sukun'], ruleNote: 'Ar-sa-la — r with sukūn.' }),
      w('نَزَّلَ', 'nazzala', 'He sent down (intensive)', { rules: ['fatha', 'shadda'], ruleNote: 'Naz-za-la — doubled zāy.' }),
      w('يَوْمَئِذٍ', 'yawma\'idhin', 'that Day', { rules: ['fatha', 'sukun', 'tanween-kasr'], ruleNote: 'Ends with -in tanwīn kasr.' }),
    ],
  },
  {
    id: 'particles',
    label: 'Particles & connectors',
    words: [
      w('إِنَّ', 'inna', 'indeed / verily', { rules: ['shadda', 'tanween'], ruleNote: 'Inna — shadda on nūn, fatḥa on alif.' }),
      w('إِلَّا', 'illā', 'except', { rules: ['kasra', 'shadda', 'long-alif'], ruleNote: 'Il-lā — kasra, doubled lām, long ā.' }),
      w('لَا', 'lā', 'no / not', { rules: ['fatha', 'long-alif'], ruleNote: 'Lā negation — long ā.' }),
      w('مَا', 'mā', 'what / not', { rules: ['fatha', 'long-alif'], ruleNote: 'Mā — context decides meaning.' }),
      w('مِن', 'min', 'from', { rules: ['kasra', 'sukun'], ruleNote: 'Min — ikhfa rules apply before certain letters.' }),
      w('إِلَى', 'ilā', 'to / toward', { rules: ['kasra', 'long-alif'], ruleNote: 'Ilā — long ā at end.' }),
      w('عَلَى', 'ʿalā', 'on / upon', { rules: ['fatha', 'shadda', 'long-alif'], ruleNote: 'ʿa-lā — ʿayn then long ā.' }),
      w('فِي', 'fī', 'in', { rules: ['kasra', 'long-ya'], ruleNote: 'Fī — kasra + long ī.' }),
      w('بِ', 'bi', 'with / by', { rules: ['kasra'], ruleNote: 'Bi — single kasra, connects to next word.' }),
      w('وَ', 'wa', 'and', { rules: ['fatha'], ruleNote: 'Wa — joins words; read lightly.' }),
      w('أَن', 'an', 'that (subordinator)', { rules: ['fatha', 'sukun'], ruleNote: 'An — nūn sukūn; ikhfa before verbs.' }),
      w('كَمَا', 'kamā', 'as / like', { rules: ['fatha', 'long-alif'], ruleNote: 'Ka-mā — comparison particle.' }),
      w('ثُمَّ', 'thumma', 'then', { rules: ['damma', 'shadda'], ruleNote: 'Thum-ma — emphatic thā, doubled mīm.' }),
      w('أَوْ', 'aw', 'or', { rules: ['fatha', 'sukun'], ruleNote: 'Aw — wāw sukūn.' }),
      w('هَلْ', 'hal', 'question marker', { rules: ['fatha', 'sukun'], ruleNote: 'Hal — starts yes/no questions.' }),
    ],
  },
  {
    id: 'short-words',
    label: 'Short words (2–4 letters)',
    words: [
      w('هُوَ', 'huwa', 'he / He', { rules: ['damma', 'fatha'], ruleNote: 'Hu-wa — pronoun.' }),
      w('هِيَ', 'hiya', 'she / it', { rules: ['kasra', 'fatha'], ruleNote: 'Hi-ya.' }),
      w('نَحْنُ', 'naḥnu', 'we', { rules: ['fatha', 'sukun', 'damma'], ruleNote: 'Naḥ-nu — ḥā with sukūn.' }),
      w('هُمْ', 'hum', 'they (m)', { rules: ['damma', 'sukun'], ruleNote: 'Hum — m sukūn at stop.' }),
      w('قُلْ', 'qul', 'say!', { rules: ['damma', 'sukun', 'qalqalah'], ruleNote: 'Qul — imperative; qalqalah on lām.' }),
      w('نُور', 'nūr', 'light', { rules: ['damma', 'long-waw'], ruleNote: 'Nūr — long ū from wāw.' }),
      w('بَيْت', 'bayt', 'house', { rules: ['fatha', 'sukun'], ruleNote: 'Bayt — t sukūn.' }),
      w('مَاء', 'mā\'', 'water', { rules: ['fatha', 'hamza-madd'], ruleNote: 'Mā\' — hamza at end for glottal stop.' }),
      w('أَرْض', 'arḍ', 'earth', { rules: ['fatha', 'sukun', 'emphatic-dad'], ruleNote: 'Arḍ — emphatic ḍād.' }),
      w('سَمَاء', 'samā\'', 'sky / heaven', { rules: ['fatha', 'hamza-madd'], ruleNote: 'Sa-mā\' — long ā before hamza.' }),
      w('رُوح', 'rūḥ', 'soul / spirit', { rules: ['damma', 'long-waw'], ruleNote: 'Rūḥ — long ū.' }),
      w('حَقّ', 'ḥaqq', 'truth / right', { rules: ['fatha', 'shadda'], ruleNote: 'Ḥaq-q — doubled qāf.' }),
      w('شَرّ', 'sharr', 'evil', { rules: ['fatha', 'shadda'], ruleNote: 'Shar-r — doubled rā.' }),
      w('خَيْر', 'khayr', 'good', { rules: ['fatha', 'sukun'], ruleNote: 'Khayr — kh then ay.' }),
      w('عَلِم', 'ʿilm', 'knowledge', { rules: ['fatha', 'kasra', 'sukun'], ruleNote: 'ʿIlm — i sound on lām.' }),
    ],
  },
  {
    id: 'medium-words',
    label: 'Medium words (5–10 letters)',
    words: [
      w('الْكِتَاب', 'al-kitāb', 'the Book', { rules: ['sun-letter', 'kasra', 'fatha', 'long-alif'], ruleNote: 'Kāf is sun letter — lām assimilates; kitāb.' }),
      w('الْقُرْآن', 'al-Qur\'ān', 'the Quran', { rules: ['sun-letter', 'damma', 'sukun', 'madd'], ruleNote: 'Qāf sun letter; Qur-ān with madd on alif.' }),
      w('رَسُول', 'rasūl', 'messenger', { rules: ['fatha', 'damma', 'long-waw'], ruleNote: 'Ra-sūl — long ū.' }),
      w('نَبِيّ', 'nabiyy', 'prophet', { rules: ['fatha', 'kasra', 'shadda'], ruleNote: 'Na-biyy — doubled yā.' }),
      w('مُؤْمِن', 'mu\'min', 'believer', { rules: ['damma', 'hamza', 'kasra', 'sukun'], ruleNote: 'Mu\'-min — hamza on wāw seat.' }),
      w('كَافِر', 'kāfir', 'disbeliever', { rules: ['fatha', 'long-alif', 'kasra'], ruleNote: 'Kā-fir.' }),
      w('صِرَاط', 'ṣirāṭ', 'path', { rules: ['kasra', 'fatha', 'long-alif', 'sukun'], ruleNote: 'Ṣi-rāṭ — emphatic ṣād.' }),
      w('عَذَاب', 'ʿadhāb', 'punishment', { rules: ['fatha', 'long-alif'], ruleNote: 'ʿA-dhāb — dhāl then long ā.' }),
      w('مُصَلٍّ', 'muṣallin', 'those who pray', { rules: ['damma', 'shadda', 'tanween'], ruleNote: 'Mu-ṣal-lin — active participle pattern.' }),
      w('مُؤْمِنُون', 'mu\'minūn', 'believers (pl)', { rules: ['damma', 'hamza', 'long-waw'], ruleNote: 'Mu\'minūn — plural ending ūn.' }),
      w('الْمَلَائِكَة', 'al-malā\'ikah', 'the angels', { rules: ['kasra', 'long-alif', 'hamza', 'fatha'], ruleNote: 'Malā\'ikah — broken plural.' }),
      w('يَوْمَ الْقِيَامَة', 'yawm al-qiyāmah', 'Day of Resurrection', { rules: ['idafa', 'kasra', 'long-alif'], ruleNote: 'Idāfa chain — Day of the Standing.' }),
      w('الْجَنَّة', 'al-jannah', 'Paradise', { rules: ['sun-letter', 'shadda'], ruleNote: 'Jīm sun letter; jan-na with shadda.' }),
      w('النَّار', 'an-nār', 'the Fire', { rules: ['sun-letter', 'shadda', 'long-alif'], ruleNote: 'Nūn sun letter — lām merges into nūn.' }),
      w('الشَّيْطَان', 'ash-shayṭān', 'Satan', { rules: ['sun-letter', 'shadda', 'fatha', 'long-alif'], ruleNote: 'Shīn sun letter; shay-ṭān.' }),
    ],
  },
  {
    id: 'long-words',
    label: 'Long words & phrases',
    words: [
      w('بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', 'Bismillāhi r-Raḥmāni r-Raḥīm', 'In the name of Allah, the Most Merciful, the Especially Merciful', {
        length: 'long',
        rules: ['kasra', 'idafa', 'shadda', 'lam-tafkhim', 'dagger-alif'],
        ruleNote: 'Chain of idāfa: bi-smi Allāhi ar-Raḥmāni ar-Raḥīm. Heavy lām in Allāh after kasra in bi-smi.',
      }),
      w('رَبِّ الْعَالَمِينَ', 'rabbi l-ʿālamīn', 'Lord of the worlds', {
        length: 'long', rules: ['kasra', 'idafa', 'long-alif'], ruleNote: 'Rab-bi — kasra + shadda on bā, then ʿālamīn.',
      }),
      w('مَالِكِ يَوْمِ الدِّينِ', 'māliki yawmi d-dīn', 'Master of the Day of Judgment', {
        length: 'long', rules: ['kasra', 'idafa', 'sun-letter', 'shadda'], ruleNote: 'Idāfa: Owner of Day of d-Dīn — dāl is sun letter.',
      }),
      w('إِيَّاكَ نَعْبُدُ', 'iyyāka naʿbudu', 'You alone we worship', {
        length: 'long', rules: ['madd', 'fatha', 'ʿayn'], ruleNote: 'Iyyāka — emphasis on You (kāf object pronoun).',
      }),
      w('اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ', 'ihdinā aṣ-ṣirāṭa l-mustaqīm', 'Guide us to the straight path', {
        length: 'long', rules: ['imperative', 'sun-letter', 'kasra', 'long-alif'], ruleNote: 'Duʿā form; ṣād sun letter in aṣ-ṣirāṭ.',
      }),
      w('قُلْ هُوَ اللَّهُ أَحَدٌ', 'Qul huwa Allāhu aḥad', 'Say: He is Allah, One', {
        length: 'long', rules: ['imperative', 'damma', 'tanween'], ruleNote: 'Start of Surah al-Ikhlās; aḥad ends with tanwīn fatḥ.',
      }),
      w('اللَّهُ الصَّمَدُ', 'Allāhu ṣ-ṣamad', 'Allah, the Eternal Refuge', {
        length: 'long', rules: ['damma', 'sun-letter', 'shadda'], ruleNote: 'Ṣād sun letter; ṣ-ṣamad with shadda.',
      }),
      w('لَمْ يَلِدْ وَلَمْ يُولَدْ', 'lam yalid wa lam yūlad', 'He neither begets nor is born', {
        length: 'long', rules: ['sukun', 'kasra', 'long-waw'], ruleNote: 'Lam negation + past tense verbs.',
      }),
      w('وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ', 'wa lam yakun lahu kufuwan aḥad', 'Nor is there any equivalent to Him', {
        length: 'long', rules: ['wa', 'sukun', 'idafa', 'tanween'], ruleNote: 'Ends Ikhlās; kufuwan aḥad — no equal.',
      }),
      w('اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ', 'Allāhu lā ilāha illā huwa l-ḥayyu l-qayyūm', 'Allah — no god but He, the Ever-Living, the Sustainer', {
        length: 'long', rules: ['damma', 'negation', 'shadda', 'idafa'], ruleNote: 'Opening of Ayat al-Kursi (2:255).',
      }),
    ],
  },
  {
    id: 'surah-phrases',
    label: 'Surah phrases & dhikr',
    words: [
      w('سُبْحَانَ اللَّه', 'subḥāna Allāh', 'Glory be to Allah', { rules: ['damma', 'sukun', 'fatha', 'idafa'], ruleNote: 'Sub-ḥā-na — dhikr phrase.' }),
      w('الْحَمْدُ لِلَّه', 'al-ḥamdu lillāh', 'Praise be to Allah', { rules: ['damma', 'idafa', 'shadda'], ruleNote: 'Li-llāh — lām assimilates to lām of Allāh.' }),
      w('اللَّهُ أَكْبَر', 'Allāhu akbar', 'Allah is Greatest', { rules: ['damma', 'fatha', 'sukun'], ruleNote: 'Takbīr — akbar comparative.' }),
      w('أَسْتَغْفِرُ اللَّه', 'astaghfiru Allāh', 'I seek forgiveness from Allah', { rules: ['fatha', 'sukun', 'kasra'], ruleNote: 'Istighfār formula.' }),
      w('إِنْ شَاءَ اللَّه', 'in shā\'a Allāh', 'if Allah wills', { rules: ['sukun', 'hamza-madd', 'idafa'], ruleNote: 'In shā\'a — madd on alif before hamza.' }),
      w('مَا شَاءَ اللَّه', 'mā shā\'a Allāh', 'what Allah willed', { rules: ['long-alif', 'hamza-madd'], ruleNote: 'Mā shā\'a — acceptance phrase.' }),
      w('بَارَكَ اللَّهُ فِيك', 'bāraka Allāhu fīk', 'May Allah bless you', { rules: ['fatha', 'damma', 'kasra'], ruleNote: 'Duʿā for someone.' }),
      w('جَزَاكَ اللَّهُ خَيْرًا', 'jazāka Allāhu khayran', 'May Allah reward you with good', { rules: ['fatha', 'damma', 'tanween'], ruleNote: 'Thanks — khayran with tanwīn.' }),
      w('السَّلَامُ عَلَيْكُم', 'as-salāmu ʿalaykum', 'peace be upon you', { rules: ['sun-letter', 'damma', 'kasra'], ruleNote: 'Greeting — sīn sun letter.' }),
      w('وَعَلَيْكُمُ السَّلَام', 'wa ʿalaykumu s-salām', 'and upon you peace', { rules: ['wa', 'damma', 'sun-letter'], ruleNote: 'Reply to salām.' }),
    ],
  },
  {
    id: 'names-attributes',
    label: 'Names & attributes',
    words: [
      w('الْحَكِيم', 'al-ḥakīm', 'the Wise', { rules: ['kasra', 'long-ya'], ruleNote: 'Ḥa-kīm — divine name pattern.' }),
      w('الْعَلِيم', 'al-ʿalīm', 'the All-Knowing', { rules: ['kasra', 'long-ya'], ruleNote: 'ʿA-līm.' }),
      w('الْقَدِير', 'al-qadīr', 'the All-Powerful', { rules: ['fatha', 'kasra', 'long-ya'], ruleNote: 'Qa-dīr.' }),
      w('الْغَفُور', 'al-ghafūr', 'the Forgiving', { rules: ['fatha', 'damma', 'long-waw'], ruleNote: 'Gha-fūr — long ū.' }),
      w('الرَّحِيم', 'ar-raḥīm', 'the Merciful', { rules: ['sun-letter', 'kasra', 'long-ya'], ruleNote: 'Rā sun letter.' }),
      w('الْخَالِق', 'al-khāliq', 'the Creator', { rules: ['fatha', 'long-alif', 'kasra'], ruleNote: 'Khā-liq — active participle.' }),
      w('الْوَدُود', 'al-wadūd', 'the Loving', { rules: ['fatha', 'damma', 'long-waw'], ruleNote: 'Wa-dūd.' }),
      w('السَّمِيع', 'as-samīʿ', 'the All-Hearing', { rules: ['sun-letter', 'kasra', 'long-ya'], ruleNote: 'Sīn sun letter.' }),
      w('الْبَصِير', 'al-baṣīr', 'the All-Seeing', { rules: ['fatha', 'kasra', 'long-ya'], ruleNote: 'Ba-ṣīr — emphatic ṣād.' }),
      w('الْحَيُّ', 'al-ḥayy', 'the Ever-Living', { rules: ['fatha', 'shadda'], ruleNote: 'Ḥay-y — shadda on yā.' }),
      w('الْقَيُّوم', 'al-qayyūm', 'the Sustainer', { rules: ['fatha', 'shadda', 'long-waw'], ruleNote: 'Qay-yūm — from Ayat al-Kursi.' }),
      w('الْأَوَّل', 'al-awwal', 'the First', { rules: ['hamza', 'shadda', 'fatha'], ruleNote: 'Aw-wal.' }),
      w('الْآخِر', 'al-ākhir', 'the Last', { rules: ['madd-alif', 'kasra'], ruleNote: 'Ā-khir.' }),
      w('الظَّاهِر', 'aẓ-ẓāhir', 'the Manifest', { rules: ['sun-letter', 'shadda', 'kasra'], ruleNote: 'Ẓā sun letter.' }),
      w('الْبَاطِن', 'al-bāṭin', 'the Hidden', { rules: ['fatha', 'long-alif', 'kasra'], ruleNote: 'Bā-ṭin — emphatic ṭā.' }),
    ],
  },
  {
    id: 'commands-stories',
    label: 'Commands & stories',
    words: [
      w('يَا', 'yā', 'O (vocative)', { rules: ['fatha', 'long-alif'], ruleNote: 'Yā — calling someone: Yā Maryam.' }),
      w('يَا أَيُّهَا', 'yā ayyuhā', 'O you (address)', { rules: ['vocative', 'long-alif'], ruleNote: 'Formal address in Quran.' }),
      w('قَصَص', 'qaṣaṣ', 'stories', { rules: ['fatha', 'sukun'], ruleNote: 'Qa-ṣaṣ — plural of qaṣaṣ.' }),
      w('آيَة', 'āyah', 'verse / sign', { rules: ['madd-alif', 'tā-marbuta'], ruleNote: 'Ā-yah — one verse of Quran.' }),
      w('سُورَة', 'sūrah', 'chapter (surah)', { rules: ['damma', 'fatha', 'tā-marbuta'], ruleNote: 'Sū-rah — 114 surahs.' }),
      w('وَحْي', 'waḥy', 'revelation', { rules: ['fatha', 'sukun'], ruleNote: 'Waḥy — divine inspiration.' }),
      w('تَوْرَاة', 'tawrāh', 'Torah', { rules: ['fatha', 'long-alif'], ruleNote: 'Taw-rāh — book given to Mūsā.' }),
      w('إِنْجِيل', 'injīl', 'Gospel', { rules: ['kasra', 'long-ya'], ruleNote: 'In-jīl — book given to ʿĪsā.' }),
      w('مُوسَى', 'mūsā', 'Moses', { rules: ['damma', 'long-waw', 'fatha'], ruleNote: 'Mū-sā — prophet name.' }),
      w('عِيسَى', 'ʿīsā', 'Jesus', { rules: ['kasra', 'long-ya', 'fatha'], ruleNote: 'ʿĪ-sā — prophet name.' }),
      w('إِبْرَاهِيم', 'ibrāhīm', 'Abraham', { rules: ['kasra', 'sukun', 'long-alif'], ruleNote: 'Ibrā-hīm — Khalīl Allāh.' }),
      w('مُحَمَّد', 'muḥammad', 'Muhammad', { rules: ['damma', 'shadda', 'fatha'], ruleNote: 'Muḥam-mad — final messenger.' }),
      w('مَرْيَم', 'maryam', 'Mary', { rules: ['fatha', 'sukun', 'fatha'], ruleNote: 'Maryam — mother of ʿĪsā.' }),
      w('فِرْعَوْن', 'firʿawn', 'Pharaoh', { rules: ['kasra', 'sukun', 'fatha'], ruleNote: 'Firʿawn — enemy of Mūsā.' }),
      w('شَدَّد', 'shaddada', 'he strengthened', { rules: ['fatha', 'shadda'], ruleNote: 'Past tense Form II — intensification.' }),
      w('أَطِيعُوا', 'aṭīʿū', 'obey (plural command)', { rules: ['fatha', 'kasra', 'long-ya'], ruleNote: 'Imperative plural — ū ending.' }),
      w('اتَّبِعُوا', 'ittabiʿū', 'follow (plural)', { rules: ['idgham', 'kasra', 'long-ya'], ruleNote: 'Ittabiʿū — follow the prophets.' }),
      w('اذْكُرُوا', 'udhkurū', 'remember (plural)', { rules: ['sukun', 'damma', 'long-waw'], ruleNote: 'Udh-ku-rū — dhikr command.' }),
      w('تَبَارَكَ', 'tabāraka', 'blessed is', { rules: ['fatha', 'long-alif', 'fatha'], ruleNote: 'Tabāraka — divine blessing formula.' }),
      w('تَعَالَى', 'taʿālā', 'Exalted is', { rules: ['fatha', 'shadda', 'long-alif'], ruleNote: 'Taʿālā — after Allāh\'s name.' }),
    ],
  },
  {
    id: 'more-particles',
    label: 'More particles & grammar',
    words: [
      w('لَوْ', 'law', 'if only / would that', { rules: ['fatha', 'sukun'], ruleNote: 'Law — counterfactual condition.' }),
      w('لَعَلَّ', 'laʿalla', 'perhaps / maybe', { rules: ['fatha', 'shadda'], ruleNote: 'Laʿalla — hope or possibility.' }),
      w('حَتَّى', 'ḥattā', 'until', { rules: ['fatha', 'shadda', 'long-alif'], ruleNote: 'Ḥattā — time or purpose.' }),
      w('بَلْ', 'bal', 'rather / but', { rules: ['fatha', 'sukun'], ruleNote: 'Bal — correction or emphasis.' }),
      w('أَمْ', 'am', 'or (question)', { rules: ['fatha', 'sukun'], ruleNote: 'Am — presents alternatives.' }),
      w('لَمْ', 'lam', 'did not (jussive)', { rules: ['fatha', 'sukun'], ruleNote: 'Lam + present → past negation.' }),
      w('لَنْ', 'lan', 'will not', { rules: ['fatha', 'sukun'], ruleNote: 'Lan + subjunctive — future negation.' }),
      w('قَدْ', 'qad', 'indeed / already', { rules: ['fatha', 'sukun'], ruleNote: 'Qad — aspect particle.' }),
      w('سَوْفَ', 'sawfa', 'will (future)', { rules: ['fatha', 'sukun', 'fatha'], ruleNote: 'Sawfa — future marker before verb.' }),
      w('عَسَى', 'ʿasā', 'perhaps', { rules: ['fatha', 'fatha', 'long-alif'], ruleNote: 'ʿAsā — hope for future.' }),
      w('إِذْ', 'idh', 'when / since', { rules: ['kasra', 'sukun'], ruleNote: 'Idh — temporal clause.' }),
      w('إِذَا', 'idhā', 'when (future)', { rules: ['kasra', 'fatha', 'long-alif'], ruleNote: 'Idhā — conditional when.' }),
      w('كَيْ', 'kay', 'so that', { rules: ['fatha', 'sukun'], ruleNote: 'Kay — purpose clause.' }),
      w('أَنْ', 'an', 'that', { rules: ['fatha', 'sukun'], ruleNote: 'An — subordinator before verb.' }),
      w('لِأَنَّ', 'li-anna', 'because', { rules: ['kasra', 'shadda'], ruleNote: 'Li-anna — causal, inna for emphasis.' }),
    ],
  },
];

// Assign IDs
const categories = VOCAB_CATEGORIES.map((cat) => ({
  ...cat,
  words: assignIds(cat.words),
}));

const allWords = categories.flatMap((c) => c.words);

// ── Spoken Arabic sentences ──
const sentences = [
  { id: 's1', arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', transliteration: 'Bismillāhi r-Raḥmāni r-Raḥīm', english: 'In the name of Allah, the Most Merciful, the Especially Merciful.', rules: ['idafa', 'harakat', 'lam-tafkhim'], level: 'beginner' },
  { id: 's2', arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', transliteration: 'Al-ḥamdu lillāhi rabbi l-ʿālamīn', english: 'All praise is due to Allah, Lord of all the worlds.', rules: ['idafa', 'sun-letter'], level: 'beginner' },
  { id: 's3', arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ', transliteration: 'Qul huwa Allāhu aḥad', english: 'Say: He is Allah, One.', rules: ['imperative', 'tanween'], level: 'beginner' },
  { id: 's4', arabic: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ', transliteration: 'Qul aʿūdhu bi-rabbi l-falaq', english: 'Say: I seek refuge in the Lord of daybreak.', rules: ['imperative', 'kasra', 'idafa'], level: 'beginner' },
  { id: 's5', arabic: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ', transliteration: 'Qul aʿūdhu bi-rabbi n-nās', english: 'Say: I seek refuge in the Lord of mankind.', rules: ['imperative', 'sun-letter'], level: 'beginner' },
  { id: 's6', arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً', transliteration: 'Rabbanā ātinā fī d-dunyā ḥasanah', english: 'Our Lord, give us good in this world.', rules: ['dua', 'kasra', 'tanween'], level: 'intermediate' },
  { id: 's7', arabic: 'وَفِي الْآخِرَةِ حَسَنَةً', transliteration: 'Wa fī l-ākhirati ḥasanah', english: 'And good in the Hereafter.', rules: ['wa', 'idafa', 'tanween'], level: 'intermediate' },
  { id: 's8', arabic: 'وَقِنَا عَذَابَ النَّار', transliteration: 'Wa qinā ʿadhāba n-nār', english: 'And protect us from the punishment of the Fire.', rules: ['wa', 'sun-letter', 'idafa'], level: 'intermediate' },
  { id: 's9', arabic: 'إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ', transliteration: 'Innā lillāhi wa innā ilayhi rājiʿūn', english: 'Indeed we belong to Allah, and indeed to Him we return.', rules: ['inna', 'idafa', 'wa'], level: 'intermediate' },
  { id: 's10', arabic: 'رَبِّ اشْرَحْ لِي صَدْرِي', transliteration: 'Rabbi ishraḥ lī ṣadrī', english: 'My Lord, expand for me my chest.', rules: ['dua', 'imperative', 'kasra'], level: 'intermediate' },
  { id: 's11', arabic: 'وَيَسِّرْ لِي أَمْرِي', transliteration: 'Wa yassir lī amrī', english: 'And ease for me my affair.', rules: ['wa', 'imperative', 'idafa'], level: 'intermediate' },
  { id: 's12', arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْجَنَّة', transliteration: 'Allāhumma innī as\'aluka l-jannah', english: 'O Allah, I ask You for Paradise.', rules: ['dua', 'inna'], level: 'advanced' },
  { id: 's13', arabic: 'وَأَعُوذُ بِكَ مِنَ النَّار', transliteration: 'Wa aʿūdhu bika mina n-nār', english: 'And I seek refuge in You from the Fire.', rules: ['wa', 'kasra', 'sun-letter'], level: 'advanced' },
  { id: 's14', arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ', transliteration: 'Subḥāna Allāhi wa bi-ḥamdih', english: 'Glory be to Allah and praise be to Him.', rules: ['dhikr', 'wa', 'idafa'], level: 'beginner' },
  { id: 's15', arabic: 'سُبْحَانَ اللَّهِ الْعَظِيم', transliteration: 'Subḥāna Allāhi l-ʿaẓīm', english: 'Glory be to Allah, the Magnificent.', rules: ['dhikr', 'idafa'], level: 'beginner' },
  { id: 's16', arabic: 'لَا إِلَٰهَ إِلَّا أَنْتَ سُبْحَانَكَ', transliteration: 'Lā ilāha illā anta subḥānaka', english: 'There is no god but You; glory be to You.', rules: ['negation', 'dua'], level: 'advanced' },
  { id: 's17', arabic: 'إِنِّي ظَلَمْتُ نَفْسِي', transliteration: 'Innī ẓalamtu nafsī', english: 'Indeed I have wronged myself.', rules: ['inna', 'idafa'], level: 'intermediate' },
  { id: 's18', arabic: 'تَوَكَّلْتُ عَلَى اللَّه', transliteration: 'Tawakkaltu ʿalā Allāh', english: 'I have relied upon Allah.', rules: ['shadda', 'idafa'], level: 'intermediate' },
  { id: 's19', arabic: 'حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ', transliteration: 'Ḥasbiya Allāhu lā ilāha illā huwa', english: 'Allah is sufficient for me; there is no god but He.', rules: ['idafa', 'negation'], level: 'advanced' },
  { id: 's20', arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ', transliteration: 'Allāhumma ṣalli ʿalā Muḥammad', english: 'O Allah, send blessings upon Muhammad.', rules: ['dua', 'kasra', 'tanween'], level: 'intermediate' },
];

// ── Word practice by length (standalone drills) ──
const wordPractice = {
  meta: {
    title: 'Word length drills',
    subtitle: 'Short → medium → long — each with transliteration and rules that apply when reading.',
  },
  short: allWords.filter((w) => w.length === 'short').slice(0, 40),
  medium: allWords.filter((w) => w.length === 'medium').slice(0, 30),
  long: allWords.filter((w) => w.length === 'long'),
};

writeFileSync(join(QURAN_DIR, 'vocab.json'), JSON.stringify({
  meta: {
    title: 'Quranic Vocabulary',
    subtitle: 'High-frequency Quran words with harakat, transliteration, and reading rules per word.',
    wordCount: allWords.length,
  },
  categories,
}, null, 2));

writeFileSync(join(QURAN_DIR, 'sentences.json'), JSON.stringify({
  meta: {
    title: 'Spoken Arabic — Quranic phrases',
    subtitle: 'Full sentences from the Quran and daily dhikr — listen, read, and note the rules.',
    count: sentences.length,
  },
  sentences,
}, null, 2));

writeFileSync(join(QURAN_DIR, 'word-practice.json'), JSON.stringify(wordPractice, null, 2));

console.log(`Built Quran content: ${allWords.length} vocab words, ${sentences.length} sentences`);
console.log(`  short: ${wordPractice.short.length}, medium: ${wordPractice.medium.length}, long: ${wordPractice.long.length}`);
