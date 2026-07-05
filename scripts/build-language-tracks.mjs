/**
 * Builds Kazakh & Russian track data (words, sentences, topics, reading, guides, speaking).
 * Run: node scripts/build-language-tracks.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import kazakhWords from './kazakh-words.mjs';
import russianWords from './russian-words.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA = join(__dirname, '../shared/data');

function ensureDir(lang) {
  const dir = join(DATA, lang);
  mkdirSync(dir, { recursive: true });
  return dir;
}

function toWordPairs(entries, langKey) {
  return entries.map((e, i) => ({
    id: i + 1,
    french: e.word,
    english: e.english,
    ...(e.context ? { context: e.context } : {}),
    ...(e.exampleFr ? { exampleFr: e.exampleFr, exampleEn: e.exampleEn } : {}),
  }));
}

function writePool(dir, lang, pairName, words) {
  for (const size of [500, 1000]) {
    const slice = words.slice(0, size);
    writeFileSync(
      join(dir, `words-${size}.json`),
      JSON.stringify(
        {
          meta: {
            size: slice.length,
            targetSize: size,
            languagePair: `en-${lang === 'kazakh' ? 'kk' : 'ru'}`,
            source: `Curated ${pairName} frequency list`,
          },
          words: slice,
        },
        null,
        2,
      ),
    );
  }
}

const TOPIC_TEMPLATES = [
  { id: 'greetings', label: 'Greetings', emoji: '👋', level: 'A1', unit: 1, order: 1 },
  { id: 'family', label: 'Family', emoji: '👨‍👩‍👧', level: 'A1', unit: 1, order: 2 },
  { id: 'numbers', label: 'Numbers', emoji: '🔢', level: 'A1', unit: 1, order: 3 },
  { id: 'food', label: 'Food & drink', emoji: '🍽️', level: 'A2', unit: 2, order: 4 },
  { id: 'home', label: 'Home', emoji: '🏠', level: 'A2', unit: 2, order: 5 },
  { id: 'time', label: 'Time & calendar', emoji: '🕐', level: 'A2', unit: 2, order: 6 },
  { id: 'body', label: 'Body & health', emoji: '🩺', level: 'A2', unit: 3, order: 7 },
  { id: 'travel', label: 'Travel', emoji: '✈️', level: 'A2', unit: 3, order: 8 },
  { id: 'work', label: 'Work & study', emoji: '💼', level: 'B1', unit: 4, order: 9 },
  { id: 'city', label: 'City life', emoji: '🏙️', level: 'B1', unit: 4, order: 10 },
  { id: 'feelings', label: 'Feelings', emoji: '💭', level: 'B1', unit: 5, order: 11 },
  { id: 'verbs', label: 'Essential verbs', emoji: '⚡', level: 'B1', unit: 5, order: 12 },
];

const TOPIC_KEYWORDS = {
  greetings: ['hello', 'goodbye', 'thank', 'please', 'sorry', 'yes', 'no', 'morning', 'evening'],
  family: ['mother', 'father', 'brother', 'sister', 'child', 'family', 'husband', 'wife', 'friend'],
  numbers: ['one', 'two', 'three', 'ten', 'hundred', 'first', 'number', 'zero'],
  food: ['food', 'water', 'bread', 'meat', 'tea', 'coffee', 'eat', 'drink', 'restaurant', 'apple'],
  home: ['house', 'room', 'door', 'window', 'kitchen', 'bed', 'live', 'home'],
  time: ['day', 'week', 'month', 'year', 'hour', 'today', 'tomorrow', 'monday', 'time'],
  body: ['head', 'hand', 'eye', 'heart', 'doctor', 'hospital', 'pain', 'health', 'sick'],
  travel: ['train', 'bus', 'ticket', 'airport', 'hotel', 'road', 'travel', 'city', 'map'],
  work: ['work', 'job', 'office', 'school', 'student', 'teacher', 'study', 'company'],
  city: ['street', 'shop', 'market', 'bank', 'post', 'police', 'park', 'building'],
  feelings: ['happy', 'sad', 'love', 'afraid', 'angry', 'tired', 'good', 'bad', 'want'],
  verbs: ['go', 'come', 'see', 'know', 'think', 'say', 'give', 'take', 'make', 'do'],
};

function assignTopics(words, langName) {
  const used = new Set();
  return TOPIC_TEMPLATES.map((t) => {
    const keys = TOPIC_KEYWORDS[t.id] ?? [];
    const topicWords = [];
    for (const w of words) {
      if (topicWords.length >= 18) break;
      const en = w.english.toLowerCase();
      if (used.has(w.word)) continue;
      if (keys.some((k) => en.includes(k))) {
        used.add(w.word);
        topicWords.push({
          id: topicWords.length + 1,
          french: w.word,
          english: w.english,
        });
      }
    }
    // Fill if sparse
    for (const w of words) {
      if (topicWords.length >= 15) break;
      if (used.has(w.word)) continue;
      used.add(w.word);
      topicWords.push({ id: topicWords.length + 1, french: w.word, english: w.english });
    }
    return {
      ...t,
      frenchLabel: t.label,
      accent: `topic-${t.id}`,
      description: `${langName} vocabulary — ${t.label.toLowerCase()}.`,
      theory: [
        {
          type: 'callout',
          variant: 'tip',
          text: `Learn these ${langName} words in context. Tap 🔊 to hear pronunciation.`,
        },
      ],
      words: topicWords.slice(0, 18),
    };
  });
}

function buildSentences(words, langName) {
  const phrases = words.slice(0, 80).map((w, i) => ({
    id: i + 1,
    french: langName === 'Kazakh'
      ? `${w.word.charAt(0).toUpperCase()}${w.word.slice(1)}.`
      : `${w.word.charAt(0).toUpperCase()}${w.word.slice(1)}.`,
    english: `${w.english.charAt(0).toUpperCase()}${w.english.slice(1)}.`,
  }));

  const extras =
    langName === 'Kazakh'
      ? [
          { id: 81, french: 'Менің атым Айгүл.', english: 'My name is Aigul.' },
          { id: 82, french: 'Сіз қайда тұрасыз?', english: 'Where do you live?' },
          { id: 83, french: 'Мен студентпін.', english: 'I am a student.' },
          { id: 84, french: 'Бұл қанша тұрады?', english: 'How much does this cost?' },
          { id: 85, french: 'Кеш батқан жақсы.', english: 'Good evening.' },
          { id: 86, french: 'Мен ағылшынша аз сөйлеймін.', english: 'I speak a little English.' },
          { id: 87, french: 'Көмектесіңізші!', english: 'Help me, please!' },
          { id: 88, french: 'Мен шаршадым.', english: 'I am tired.' },
          { id: 89, french: 'Ертең кездесеміз.', english: 'We will meet tomorrow.' },
          { id: 90, french: 'Бұл өте дәмді!', english: 'This is very tasty!' },
        ]
      : [
          { id: 81, french: 'Меня зовут Анна.', english: 'My name is Anna.' },
          { id: 82, french: 'Где вы живёте?', english: 'Where do you live?' },
          { id: 83, french: 'Я студент.', english: 'I am a student.' },
          { id: 84, french: 'Сколько это стоит?', english: 'How much does this cost?' },
          { id: 85, french: 'Добрый вечер.', english: 'Good evening.' },
          { id: 86, french: 'Я немного говорю по-английски.', english: 'I speak a little English.' },
          { id: 87, french: 'Помогите, пожалуйста!', english: 'Help me, please!' },
          { id: 88, french: 'Я устал.', english: 'I am tired.' },
          { id: 89, french: 'До завтра.', english: 'See you tomorrow.' },
          { id: 90, french: 'Это очень вкусно!', english: 'This is very tasty!' },
        ];

  return {
    meta: { size: phrases.length + extras.length, languagePair: langName === 'Kazakh' ? 'en-kk' : 'en-ru', level: 'beginner-intermediate' },
    sentences: [...phrases.slice(0, 80), ...extras],
  };
}

function buildReading(langName) {
  const isKk = langName === 'Kazakh';
  const articles = isKk
    ? [
        {
          id: 1,
          title: 'Алматыда бір күн',
          subtitle: 'A Day in Almaty',
          level: 'A2',
          topic: 'Travel & City',
          paragraphs: [
            {
              french: 'Демалыс күні мен ерте оятқышпен ояндым. Терезеден Алатау тауларын көрдім — ауа таза, күн жарқын. Мен қала орталығына баруды шештім.',
              english: 'On my day off I woke up early without an alarm. Through the window I saw the Alatau mountains — the air was fresh, the sun bright. I decided to go to the city centre.',
            },
            {
              french: 'Алдымен мен «Астана» базарында жеміс пен нан сатып алдым. Сатушылар мейірімді, бағаңдар қолжетімді. Кейін мен көше музыканттарын тыңдап, кофе іштім.',
              english: 'First I bought fruit and bread at the Green Bazaar. The sellers were friendly, the prices affordable. Then I listened to street musicians and drank coffee.',
            },
            {
              french: 'Кешке мен достарыммен кездестім. Біз ұлттық тамақ — бесбармақ пен шай іштік. «Ертең тағы келеміз», — дедік. Алматы маған әр күнде жаңа сезім береді.',
              english: 'In the evening I met my friends. We ate national food — beshbarmak and tea. "We will come again tomorrow," we said. Almaty gives me new feelings every day.',
            },
          ],
          vocab: [
            { fr: 'демалыс', en: 'day off / holiday' },
            { fr: 'тау', en: 'mountain' },
            { fr: 'бazar', en: 'bazaar / market' },
            { fr: 'сатушы', en: 'seller' },
            { fr: 'ұлттық', en: 'national' },
            { fr: 'кездесу', en: 'to meet' },
          ],
        },
        {
          id: 2,
          title: 'Жаңа семья',
          subtitle: 'A New Family',
          level: 'A1–A2',
          topic: 'Family & Home',
          paragraphs: [
            {
              french: 'Менің отбасым кішкентай: анам, әкем, мен және кіші інім. Біз Астанада тұрамыз. Әкем инженер, анам мұғалім.',
              english: 'My family is small: my mother, father, me and my younger brother. We live in Astana. My father is an engineer, my mother is a teacher.',
            },
            {
              french: 'Күн сайын таңертең біз бірге таңғы ас ішеміз. Инім мектепке барады, мен университетке. Кешке біз отбасымен кино көреміз немесе сөйлесеміз.',
              english: 'Every morning we have breakfast together. My brother goes to school, I go to university. In the evening we watch films or talk as a family.',
            },
          ],
          vocab: [
            { fr: 'отбасы', en: 'family' },
            { fr: 'іні', en: 'younger brother' },
            { fr: 'мұғалім', en: 'teacher' },
            { fr: 'таңғы ас', en: 'breakfast' },
            { fr: 'университет', en: 'university' },
          ],
        },
      ]
    : [
        {
          id: 1,
          title: 'День в Москве',
          subtitle: 'A Day in Moscow',
          level: 'A2',
          topic: 'Travel & City',
          paragraphs: [
            {
              french: 'В субботу я рано проснулся и решил прогуляться по центру Москвы. Воздух был прохладный, но солнце светило ярко. Я вышел из метро у Красной площади.',
              english: 'On Saturday I woke up early and decided to walk around central Moscow. The air was cool but the sun shone brightly. I left the metro at Red Square.',
            },
            {
              french: 'Я долго смотрел на собор Василия Блаженного и фотографировал. Потом я зашёл в маленькое кафе и заказал кофе с пирогом. Официант был очень вежлив.',
              english: 'I looked at St Basil\'s Cathedral for a long time and took photos. Then I went into a small café and ordered coffee with pie. The waiter was very polite.',
            },
            {
              french: 'Вечером я встретился с друзьями. Мы гуляли по набережной и говорили о работе и планах. «Москва никогда не спит», — сказал мой друг, и мы рассмеялись.',
              english: 'In the evening I met friends. We walked along the embankment and talked about work and plans. "Moscow never sleeps," said my friend, and we laughed.',
            },
          ],
          vocab: [
            { fr: 'проснуться', en: 'to wake up' },
            { fr: 'площадь', en: 'square' },
            { fr: 'собор', en: 'cathedral' },
            { fr: 'набережная', en: 'embankment' },
            { fr: 'вежливый', en: 'polite' },
          ],
        },
        {
          id: 2,
          title: 'Моя семья',
          subtitle: 'My Family',
          level: 'A1–A2',
          topic: 'Family & Home',
          paragraphs: [
            {
              french: 'У меня большая и дружная семья. Я живу с родителями и младшей сестрой в Санкт-Петербурге. Мой отец работает врачом, мама — бухгалтер.',
              english: 'I have a large and close family. I live with my parents and younger sister in Saint Petersburg. My father works as a doctor, my mother is an accountant.',
            },
            {
              french: 'По воскресеньям мы всегда собираемся за столом. Бабушка готовит суп и рассказывает истории из детства. Эти вечера — самая важная традиция в нашей семье.',
              english: 'On Sundays we always gather at the table. Grandma makes soup and tells stories from childhood. These evenings are the most important tradition in our family.',
            },
          ],
          vocab: [
            { fr: 'семья', en: 'family' },
            { fr: 'родители', en: 'parents' },
            { fr: 'сестра', en: 'sister' },
            { fr: 'бабушка', en: 'grandmother' },
            { fr: 'традиция', en: 'tradition' },
          ],
        },
      ];

  return {
    meta: {
      title: 'Reading',
      subtitle: `Graded ${langName} texts with English side by side — hover highlighted words for pronunciation.`,
    },
    articles,
  };
}

function buildGrammar(langName) {
  const isKk = langName === 'Kazakh';
  return {
    meta: {
      title: 'Grammar',
      subtitle: isKk
        ? 'Kazakh cases, vowel harmony, word order, and pronouns — with English notes.'
        : 'Russian cases, gender, verbs, and word order — with English notes.',
      accent: isKk ? 'teal' : 'sky',
    },
    sections: [
      {
        id: 'intro',
        number: 1,
        title: 'Overview',
        blocks: [
          {
            type: 'paragraph',
            text: isKk
              ? 'Kazakh is a Turkic language written in Cyrillic (Latin script is also used). It has <strong>vowel harmony</strong> and <strong>agglutinative</strong> suffixes — one suffix often = one grammatical meaning.'
              : 'Russian uses the Cyrillic alphabet and <strong>six cases</strong>. Nouns have gender (masculine, feminine, neuter) and adjectives agree with nouns.',
          },
          {
            type: 'callout',
            variant: 'compare-en',
            text: '🇬🇧 English word order is mostly fixed (Subject–Verb–Object). Both Kazakh and Russian allow more flexible order because suffixes show grammatical roles.',
          },
        ],
      },
      {
        id: 'pronouns',
        number: 2,
        title: 'Personal pronouns',
        blocks: [
          {
            type: 'table',
            headers: isKk ? ['Kazakh', 'English'] : ['Russian', 'English'],
            rows: isKk
              ? [['мен', 'I'], ['сен', 'you (informal)'], ['сіз', 'you (formal)'], ['ол', 'he/she'], ['біз', 'we'], ['олар', 'they']]
              : [['я', 'I'], ['ты', 'you (informal)'], ['вы', 'you (formal/plural)'], ['он', 'he'], ['она', 'she'], ['мы', 'we'], ['они', 'they']],
          },
        ],
      },
      {
        id: 'questions',
        number: 3,
        title: 'Questions & negation',
        blocks: [
          {
            type: 'paragraph',
            text: isKk
              ? 'Yes/no questions often use question intonation or the particle <code>ма/ме</code>. Negation uses <code>жоқ</code> (non-existence) or <code>-ма/-ме</code> suffixes on verbs.'
              : 'Questions use question words (<em>кто, что, где, когда, почему, как</em>) or intonation. Negation uses <code>не</code> or <code>ни</code> depending on context.',
          },
          {
            type: 'example',
            fr: isKk ? 'Сіз қазақша сөйлейсіз бе?' : 'Вы говорите по-русски?',
            en: isKk ? 'Do you speak Kazakh?' : 'Do you speak Russian?',
          },
        ],
      },
    ],
  };
}

function buildPronunciation(langName) {
  const isKk = langName === 'Kazakh';
  return {
    meta: {
      title: 'Sounds',
      subtitle: isKk
        ? 'Kazakh vowels, harmony, and Cyrillic letters that differ from Russian.'
        : 'Russian vowels, consonants, stress, and soft/hard pairs.',
      accent: isKk ? 'teal' : 'sky',
    },
    sections: [
      {
        id: 'alphabet',
        number: 1,
        title: 'Alphabet essentials',
        blocks: [
          {
            type: 'paragraph',
            text: isKk
              ? 'Kazakh Cyrillic includes special letters: <strong>ә, ғ, қ, ң, ө, ұ, ү, h, і</strong>. Vowel harmony means front vowels (е, i, ü…) take front suffixes.'
              : 'Russian has 33 letters. Stress is unpredictable — always learn nouns with stress marked. Soft sign <strong>ь</strong> and hard sign <strong>ъ</strong> change pronunciation.',
          },
        ],
      },
      {
        id: 'tips',
        number: 2,
        title: 'Pronunciation tips',
        blocks: [
          {
            type: 'list',
            items: isKk
              ? ['Roll or tap /r/ lightly', 'Қ is a back k — deeper in the throat', 'Listen for vowel length — it can change meaning', 'Use 🔊 on every word in Vocab and Reading']
              : ['Reduce unstressed <em>o</em> and <em>a</em> (e.g. молоко → malako)', 'Practice soft л vs hard л', 'Palatalized consonants before е, ё, и, ю, я', 'Use 🔊 on every word in Vocab and Reading'],
          },
        ],
      },
    ],
  };
}

function buildSpeaking(words, langName) {
  const isKk = langName === 'Kazakh';
  const sections = [
    {
      id: 'basics',
      label: 'Basics',
      frenchLabel: isKk ? 'Негіздер' : 'Основы',
      description: 'Essential everyday phrases.',
      sentences: words.slice(0, 25).map((w, i) => ({
        id: i + 1,
        french: w.word,
        english: w.english,
      })),
    },
    {
      id: 'questions',
      label: 'Questions',
      frenchLabel: isKk ? 'Сұрақтар' : 'Вопросы',
      description: 'Asking for help, directions, and prices.',
      sentences: (isKk
        ? [
            { french: 'Бұл не?', english: 'What is this?' },
            { french: 'Сіз қайда?', english: 'Where are you?' },
            { french: 'Қашан?', english: 'When?' },
            { french: 'Неге?', english: 'Why?' },
            { french: 'Кім?', english: 'Who?' },
            { french: 'Қалай?', english: 'How?' },
          ]
        : [
            { french: 'Что это?', english: 'What is this?' },
            { french: 'Где вы?', english: 'Where are you?' },
            { french: 'Когда?', english: 'When?' },
            { french: 'Почему?', english: 'Why?' },
            { french: 'Кто?', english: 'Who?' },
            { french: 'Как?', english: 'How?' },
          ]
      ).map((s, i) => ({ id: i + 1, ...s })),
    },
    {
      id: 'social',
      label: 'Social',
      frenchLabel: isKk ? 'Қарым-қатынас' : 'Общение',
      description: 'Friendly conversation phrases.',
      sentences: words.slice(25, 45).map((w, i) => ({
        id: i + 1,
        french: w.word,
        english: w.english,
      })),
    },
  ];
  return {
    meta: {
      subtitle: `${langName} phrases for speaking practice — tap 🔊 to hear each line.`,
    },
    sections,
  };
}

function buildTrack(lang, entries, langName) {
  const dir = ensureDir(lang);
  const words = toWordPairs(entries, lang);
  writePool(dir, lang, langName, words);

  writeFileSync(join(dir, 'sentences.json'), JSON.stringify(buildSentences(entries, langName), null, 2));
  writeFileSync(join(dir, 'topics.json'), JSON.stringify({ topics: assignTopics(entries, langName) }, null, 2));
  writeFileSync(join(dir, 'reading-articles.json'), JSON.stringify(buildReading(langName), null, 2));
  writeFileSync(join(dir, 'guide-grammar.json'), JSON.stringify(buildGrammar(langName), null, 2));
  writeFileSync(join(dir, 'guide-pronunciation.json'), JSON.stringify(buildPronunciation(langName), null, 2));
  writeFileSync(join(dir, 'speaking-sentences.json'), JSON.stringify(buildSpeaking(entries, langName), null, 2));

  console.log(`${langName}: ${words.length} words → shared/data/${lang}/`);
}

buildTrack('kazakh', kazakhWords, 'Kazakh');
buildTrack('russian', russianWords, 'Russian');
console.log('Done.');
