/**
 * Builds Kazakh, Russian & Korean track data (words, sentences, topics, reading, guides, speaking).
 * Words are sorted by learning-progression tier (Duolingo-style) instead of raw frequency.
 * Run: node scripts/build-language-tracks.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import kazakhWords from './kazakh-words.mjs';
import russianWords from './russian-words.mjs';
import koreanWords from './korean-words.mjs';
import { sortByLearning } from './learning-progression.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA = join(__dirname, '../shared/data');

function ensureDir(lang) {
  const dir = join(DATA, lang);
  mkdirSync(dir, { recursive: true });
  return dir;
}

const LANG_CODE = { kazakh: 'kk', russian: 'ru', korean: 'ko' };

function toWordPairs(entries, langKey) {
  // Sort by learning progression tier before assigning IDs
  const sorted = sortByLearning(entries);
  return sorted.map((e, i) => ({
    id: i + 1,
    french: e.word,
    english: e.english,
    ...(e.context ? { context: e.context } : {}),
    ...(e.exampleFr ? { exampleFr: e.exampleFr, exampleEn: e.exampleEn } : {}),
  }));
}

function writePool(dir, lang, pairName, words) {
  const code = LANG_CODE[lang] ?? lang;
  for (const size of [500, 1000]) {
    const slice = words.slice(0, size);
    writeFileSync(
      join(dir, `words-${size}.json`),
      JSON.stringify(
        {
          meta: {
            size: slice.length,
            targetSize: size,
            languagePair: `en-${code}`,
            source: `Curated ${pairName} — learning-progression order`,
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

const EXTRA_SENTENCES = {
  Kazakh: [
    { french: 'Менің атым Айгүл.', english: 'My name is Aigul.' },
    { french: 'Сіз қайда тұрасыз?', english: 'Where do you live?' },
    { french: 'Мен студентпін.', english: 'I am a student.' },
    { french: 'Бұл қанша тұрады?', english: 'How much does this cost?' },
    { french: 'Кеш батқан жақсы.', english: 'Good evening.' },
    { french: 'Мен ағылшынша аз сөйлеймін.', english: 'I speak a little English.' },
    { french: 'Көмектесіңізші!', english: 'Help me, please!' },
    { french: 'Мен шаршадым.', english: 'I am tired.' },
    { french: 'Ертең кездесеміз.', english: 'We will meet tomorrow.' },
    { french: 'Бұл өте дәмді!', english: 'This is very tasty!' },
    { french: 'Қазақстан — менің Отаным.', english: 'Kazakhstan is my homeland.' },
    { french: 'Маған кофе ұнайды.', english: 'I like coffee.' },
    { french: 'Ол мектепте оқиды.', english: 'He/she studies at school.' },
    { french: 'Біз серуенге шықтық.', english: 'We went for a walk.' },
    { french: 'Қанша сағат болды?', english: 'What time is it?' },
  ],
  Russian: [
    { french: 'Меня зовут Анна.', english: 'My name is Anna.' },
    { french: 'Где вы живёте?', english: 'Where do you live?' },
    { french: 'Я студент.', english: 'I am a student.' },
    { french: 'Сколько это стоит?', english: 'How much does this cost?' },
    { french: 'Добрый вечер.', english: 'Good evening.' },
    { french: 'Я немного говорю по-английски.', english: 'I speak a little English.' },
    { french: 'Помогите, пожалуйста!', english: 'Help me, please!' },
    { french: 'Я устал.', english: 'I am tired.' },
    { french: 'До завтра.', english: 'See you tomorrow.' },
    { french: 'Это очень вкусно!', english: 'This is very tasty!' },
    { french: 'Россия — моя Родина.', english: 'Russia is my homeland.' },
    { french: 'Мне нравится кофе.', english: 'I like coffee.' },
    { french: 'Она учится в университете.', english: 'She studies at university.' },
    { french: 'Мы пошли гулять в парк.', english: 'We went for a walk in the park.' },
    { french: 'Который час?', english: 'What time is it?' },
  ],
  Korean: [
    { french: '제 이름은 지민이에요.', english: 'My name is Jimin.' },
    { french: '어디에 사세요?', english: 'Where do you live?' },
    { french: '저는 학생이에요.', english: 'I am a student.' },
    { french: '이것은 얼마예요?', english: 'How much does this cost?' },
    { french: '안녕히 주무세요.', english: 'Good night.' },
    { french: '저는 영어를 조금 해요.', english: 'I speak a little English.' },
    { french: '도와주세요!', english: 'Help me, please!' },
    { french: '저는 피곤해요.', english: 'I am tired.' },
    { french: '내일 봐요.', english: 'See you tomorrow.' },
    { french: '정말 맛있어요!', english: 'This is very tasty!' },
    { french: '한국은 제 고향이에요.', english: 'Korea is my homeland.' },
    { french: '저는 커피를 좋아해요.', english: 'I like coffee.' },
    { french: '그녀는 대학교에서 공부해요.', english: 'She studies at university.' },
    { french: '우리는 공원에 산책하러 갔어요.', english: 'We went for a walk in the park.' },
    { french: '지금 몇 시예요?', english: 'What time is it?' },
  ],
};

function buildSentences(words, langName) {
  const code = langName === 'Kazakh' ? 'en-kk' : langName === 'Korean' ? 'en-ko' : 'en-ru';
  const phrases = words.slice(0, 80).map((w, i) => ({
    id: i + 1,
    french: `${w.word.charAt(0).toUpperCase()}${w.word.slice(1)}.`,
    english: `${w.english.charAt(0).toUpperCase()}${w.english.slice(1)}.`,
  }));
  const extras = (EXTRA_SENTENCES[langName] ?? []).map((s, i) => ({ id: phrases.length + i + 1, ...s }));
  return {
    meta: { size: phrases.length + extras.length, languagePair: code, level: 'beginner-intermediate' },
    sentences: [...phrases, ...extras],
  };
}

const READING_ARTICLES = {
  Kazakh: [
    {
      id: 1, title: 'Алматыда бір күн', subtitle: 'A Day in Almaty', level: 'A2', topic: 'Travel & City',
      paragraphs: [
        { french: 'Демалыс күні мен ерте оятқышпен ояндым. Терезеден Алатау тауларын көрдім — ауа таза, күн жарқын. Мен қала орталығына баруды шештім.', english: 'On my day off I woke up early. Through the window I saw the Alatau mountains — the air was fresh, the sun bright. I decided to go to the city centre.' },
        { french: 'Алдымен мен базарда жеміс пен нан сатып алдым. Сатушылар мейірімді, бағалар қолжетімді. Кейін мен көше музыканттарын тыңдап, кофе іштім.', english: 'First I bought fruit and bread at the bazaar. The sellers were friendly, the prices affordable. Then I listened to street musicians and drank coffee.' },
        { french: 'Кешке мен достарыммен кездестім. Біз ұлттық тамақ — бесбармақ пен шай іштік. «Ертең тағы келеміз», — дедік. Алматы маған әр күнде жаңа сезім береді.', english: 'In the evening I met my friends. We ate national food — beshbarmak and tea. "We will come again tomorrow," we said. Almaty gives me new feelings every day.' },
      ],
      vocab: [{ fr: 'демалыс', en: 'day off' }, { fr: 'тау', en: 'mountain' }, { fr: 'базар', en: 'bazaar' }, { fr: 'сатушы', en: 'seller' }, { fr: 'ұлттық', en: 'national' }, { fr: 'кездесу', en: 'to meet' }],
    },
    {
      id: 2, title: 'Менің отбасым', subtitle: 'My Family', level: 'A1', topic: 'Family & Home',
      paragraphs: [
        { french: 'Менің отбасым кішкентай: анам, әкем, мен және кіші інім. Біз Астанада тұрамыз. Әкем инженер, анам мұғалім.', english: 'My family is small: my mother, father, me and my younger brother. We live in Astana. My father is an engineer, my mother is a teacher.' },
        { french: 'Күн сайын таңертең біз бірге таңғы ас ішеміз. Інім мектепке барады, мен университетке. Кешке біз отбасымен кино көреміз немесе сөйлесеміз.', english: 'Every morning we have breakfast together. My brother goes to school, I go to university. In the evening we watch films or talk as a family.' },
        { french: 'Апта сайын жексенбіде біз барлығымыз бас қосамыз. Анам бесбармақ пісіреді. Бұл біздің ең сүйікті дәстүрімізге айналды.', english: 'Every Sunday we all gather together. My mother cooks beshbarmak. This has become our favourite tradition.' },
      ],
      vocab: [{ fr: 'отбасы', en: 'family' }, { fr: 'іні', en: 'younger brother' }, { fr: 'мұғалім', en: 'teacher' }, { fr: 'таңғы ас', en: 'breakfast' }, { fr: 'дәстүр', en: 'tradition' }],
    },
    {
      id: 3, title: 'Базарда сауда', subtitle: 'Shopping at the Bazaar', level: 'A2', topic: 'Shopping',
      paragraphs: [
        { french: 'Мен жексенбі сайын базарға барамын. Сонда мен жеміс, көкөніс және нан сатып аламын. Базардағы бағалар дүкенге қарағанда арзан.', english: 'I go to the bazaar every Sunday. There I buy fruit, vegetables and bread. Prices at the bazaar are cheaper than in the shop.' },
        { french: 'Бүгін мен сатушымен бағаны саудаластым. «Бір килограм алма қанша?» — деп сұрадым. «Екі жүз теңге», — деді ол. Мен бес кило сатып алдым.', english: 'Today I bargained with the seller over the price. "How much is a kilogram of apples?" I asked. "Two hundred tenge," he said. I bought five kilos.' },
        { french: 'Базар өте тіршілікті жер. Адамдар сөйлеседі, күледі, таныстарымен кездеседі. Мен базарға тек саудаға емес, атмосфераның үшін де барамын.', english: 'The bazaar is a very lively place. People talk, laugh, meet acquaintances. I go to the bazaar not only to shop but also for the atmosphere.' },
      ],
      vocab: [{ fr: 'баға', en: 'price' }, { fr: 'арзан', en: 'cheap' }, { fr: 'саудаласу', en: 'to bargain' }, { fr: 'килограмм', en: 'kilogram' }, { fr: 'тіршілікті', en: 'lively' }],
    },
    {
      id: 4, title: 'Дала мен табиғат', subtitle: 'Steppe and Nature', level: 'B1', topic: 'Nature',
      paragraphs: [
        { french: 'Қазақстан — дала елі. Шексіз жазықтық, биік аспан, жыл мезгілінің өзгерісі — мұның бәрі қазақ халқының жанына сіңген.', english: 'Kazakhstan is a land of steppe. The endless plain, high sky, changing seasons — all of this is ingrained in the soul of the Kazakh people.' },
        { french: 'Көктемде дала жасыл шөппен жабылады. Жазда күн қатты ысытады, ал қыста суық боран соғады. Осы қатаң табиғат халықты шыдамды және күшті еткен.', english: 'In spring the steppe is covered with green grass. In summer the sun beats down hard, while in winter cold blizzards blow. This harsh nature has made the people patient and strong.' },
        { french: 'Бүгінгі таңда қалалар өсіп жатыр, бірақ далаға деген сүйіспеншілік жоғалған жоқ. Көптеген қазақтар жыл сайын ауылға барып, табиғатты сағынышпен жолыға алады.', english: 'Nowadays cities are growing, but the love for the steppe has not disappeared. Many Kazakhs visit the village every year and joyfully reunite with nature.' },
      ],
      vocab: [{ fr: 'дала', en: 'steppe' }, { fr: 'шексіз', en: 'endless' }, { fr: 'боран', en: 'blizzard' }, { fr: 'шыдамды', en: 'patient / enduring' }, { fr: 'сағыну', en: 'to miss / to long for' }],
    },
    {
      id: 5, title: 'Жұмыс іздеу', subtitle: 'Looking for Work', level: 'B1', topic: 'Work',
      paragraphs: [
        { french: 'Университетті бітіргеннен кейін мен жұмыс іздей бастадым. Интернетте және газеттерде хабарландыруларды қарадым. Бір апта ішінде мен он компанияға өтінім жібердім.', english: 'After graduating from university I started looking for work. I looked at advertisements on the internet and in newspapers. Within a week I sent applications to ten companies.' },
        { french: 'Үш компания мені сұхбатқа шақырды. Бірінші сұхбатта мен өте қатты қобалжыдым. Бірақ екінші сұхбатта менің сенімділігім артты.', english: 'Three companies invited me for an interview. At the first interview I was very nervous. But by the second interview my confidence had grown.' },
        { french: 'Ақырында маған ұсыныс жасалды. Бұл шағын компания, бірақ жақсы команда. Мен өз мансабымды осы жерден бастауды шештім.', english: 'In the end I received an offer. It is a small company but a good team. I decided to start my career here.' },
      ],
      vocab: [{ fr: 'жұмыс іздеу', en: 'to look for work' }, { fr: 'өтінім', en: 'application' }, { fr: 'сұхбат', en: 'interview' }, { fr: 'сенімділік', en: 'confidence' }, { fr: 'мансап', en: 'career' }],
    },
    {
      id: 6, title: 'Той дастархан', subtitle: 'The Wedding Feast', level: 'B1', topic: 'Culture',
      paragraphs: [
        { french: 'Қазақ тойы — ерекше мереке. Туыс-туған, дос-жаран жиналады. Дастархан молшылыққа толы: ет, нан, тәтті тағамдар.', english: 'A Kazakh wedding is a special celebration. Relatives and friends gather. The table is filled with abundance: meat, bread, sweet dishes.' },
        { french: 'Тойда ән мен күй тыңдалады. Жырау немесе ән салушы халықтық жырларды орындайды. Жастар биге шығады, ал үлкендер сөйлейді.', english: 'At the wedding, songs and music are heard. A zhyrau or singer performs folk songs. The young people dance while the elders speak.' },
        { french: 'Той бірнеше күнге созылуы мүмкін. Дәстүрлер бойынша, үлкен кісілер бата береді — тілек пен батасын жастарға арнайды. Бұл дәстүр жас ұрпаққа жалғасып келеді.', english: 'The wedding can last several days. According to tradition the elders give a bata — a blessing and wish dedicated to the young couple. This tradition continues to the younger generation.' },
      ],
      vocab: [{ fr: 'той', en: 'celebration / wedding' }, { fr: 'дастархан', en: 'feast table' }, { fr: 'жырау', en: 'traditional poet-singer' }, { fr: 'бата', en: 'blessing' }, { fr: 'ұрпақ', en: 'generation' }],
    },
  ],

  Russian: [
    {
      id: 1, title: 'День в Москве', subtitle: 'A Day in Moscow', level: 'A2', topic: 'Travel & City',
      paragraphs: [
        { french: 'В субботу я рано проснулся и решил прогуляться по центру Москвы. Воздух был прохладный, но солнце светило ярко. Я вышел из метро у Красной площади.', english: 'On Saturday I woke up early and decided to walk around central Moscow. The air was cool but the sun shone brightly. I left the metro at Red Square.' },
        { french: 'Я долго смотрел на собор Василия Блаженного и фотографировал. Потом я зашёл в маленькое кафе и заказал кофе с пирогом. Официант был очень вежлив.', english: 'I looked at St Basil\'s Cathedral for a long time and took photos. Then I went into a small café and ordered coffee with pie. The waiter was very polite.' },
        { french: 'Вечером я встретился с друзьями. Мы гуляли по набережной и говорили о работе и планах. «Москва никогда не спит», — сказал мой друг, и мы рассмеялись.', english: 'In the evening I met friends. We walked along the embankment and talked about work and plans. "Moscow never sleeps," said my friend, and we laughed.' },
      ],
      vocab: [{ fr: 'проснуться', en: 'to wake up' }, { fr: 'площадь', en: 'square' }, { fr: 'собор', en: 'cathedral' }, { fr: 'набережная', en: 'embankment' }, { fr: 'вежливый', en: 'polite' }],
    },
    {
      id: 2, title: 'Моя семья', subtitle: 'My Family', level: 'A1', topic: 'Family & Home',
      paragraphs: [
        { french: 'У меня большая и дружная семья. Я живу с родителями и младшей сестрой в Санкт-Петербурге. Мой отец работает врачом, мама — бухгалтер.', english: 'I have a large and close family. I live with my parents and younger sister in Saint Petersburg. My father works as a doctor, my mother is an accountant.' },
        { french: 'По воскресеньям мы всегда собираемся за столом. Бабушка готовит суп и рассказывает истории из детства. Эти вечера — самая важная традиция в нашей семье.', english: 'On Sundays we always gather at the table. Grandma makes soup and tells stories from childhood. These evenings are the most important tradition in our family.' },
        { french: 'Папа любит читать книги, мама — смотреть фильмы. Мы часто спорим о том, что лучше. Но в конце всегда смеёмся вместе — это главное.', english: 'Dad likes to read books, mum likes to watch films. We often argue about which is better. But in the end we always laugh together — that is what matters.' },
      ],
      vocab: [{ fr: 'семья', en: 'family' }, { fr: 'родители', en: 'parents' }, { fr: 'сестра', en: 'sister' }, { fr: 'бабушка', en: 'grandmother' }, { fr: 'традиция', en: 'tradition' }],
    },
    {
      id: 3, title: 'В магазине', subtitle: 'At the Shop', level: 'A2', topic: 'Shopping',
      paragraphs: [
        { french: 'Я пошёл в супермаркет, чтобы купить продукты на неделю. Я взял тележку и начал с овощного отдела. Мне нужны были помидоры, огурцы и картошка.', english: 'I went to the supermarket to buy groceries for the week. I took a trolley and started at the vegetable section. I needed tomatoes, cucumbers and potatoes.' },
        { french: 'В кассе была длинная очередь. Я подождал минут десять. Когда подошла моя очередь, кассирша улыбнулась и спросила: «Нужен пакет?» Я сказал: «Да, пожалуйста».', english: 'There was a long queue at the checkout. I waited about ten minutes. When my turn came the cashier smiled and asked: "Do you need a bag?" I said: "Yes, please".' },
        { french: 'Я потратил около тысячи рублей. Это немного больше, чем обычно, потому что цены выросли. Но продукты свежие и качественные — это важнее.', english: 'I spent about a thousand roubles. That is a bit more than usual because prices have risen. But the products are fresh and good quality — that matters more.' },
      ],
      vocab: [{ fr: 'тележка', en: 'shopping trolley' }, { fr: 'очередь', en: 'queue' }, { fr: 'кассирша', en: 'female cashier' }, { fr: 'потратить', en: 'to spend (money)' }, { fr: 'качественный', en: 'quality / high-grade' }],
    },
    {
      id: 4, title: 'Русская зима', subtitle: 'Russian Winter', level: 'B1', topic: 'Nature',
      paragraphs: [
        { french: 'Зима в России — особенное время. В ноябре начинает падать снег и температура опускается ниже нуля. К декабрю улицы покрываются толстым белым слоем.', english: 'Winter in Russia is a special time. In November snow begins to fall and the temperature drops below zero. By December the streets are covered with a thick white layer.' },
        { french: 'Русские любят зиму, несмотря на мороз. Люди катаются на лыжах, на коньках, лепят снеговиков. Дети особенно рады снегу — для них это праздник.', english: 'Russians love winter despite the frost. People ski, ice-skate, build snowmen. Children are especially happy about snow — for them it is a celebration.' },
        { french: 'Но самое приятное зимой — это вернуться домой после прогулки. Снять мокрые варежки, выпить горячего чая с мёдом и сидеть у тёплой батареи. Вот это счастье!', english: 'But the best thing in winter is to come home after a walk. Take off wet mittens, drink hot tea with honey and sit by the warm radiator. That is happiness!' },
      ],
      vocab: [{ fr: 'мороз', en: 'frost / freezing cold' }, { fr: 'снеговик', en: 'snowman' }, { fr: 'варежки', en: 'mittens' }, { fr: 'мёд', en: 'honey' }, { fr: 'батарея', en: 'radiator / heater' }],
    },
    {
      id: 5, title: 'Первый рабочий день', subtitle: 'First Day at Work', level: 'B1', topic: 'Work',
      paragraphs: [
        { french: 'Мой первый рабочий день начался с волнения. Я приехал в офис на пятнадцать минут раньше. Охранник попросил предъявить документы и выдал мне пропуск.', english: 'My first day at work started with nerves. I arrived at the office fifteen minutes early. The security guard asked to see my documents and gave me a pass.' },
        { french: 'Коллеги встретили меня тепло. Менеджер показал мне рабочее место и объяснил основные задачи. Программы были незнакомые, но я старался запомнить всё быстро.', english: 'My colleagues welcomed me warmly. The manager showed me my workstation and explained the main tasks. The programmes were unfamiliar, but I tried to learn everything quickly.' },
        { french: 'В обеденный перерыв мы с коллегами пошли в кафе рядом с офисом. За разговором я узнал много интересного о компании. К концу дня усталость прошла — осталось только удовлетворение.', english: 'During the lunch break my colleagues and I went to a café near the office. Over conversation I learnt a lot of interesting things about the company. By the end of the day my tiredness passed — only satisfaction remained.' },
      ],
      vocab: [{ fr: 'волнение', en: 'anxiety / excitement' }, { fr: 'пропуск', en: 'pass / ID badge' }, { fr: 'рабочее место', en: 'workstation' }, { fr: 'обеденный перерыв', en: 'lunch break' }, { fr: 'удовлетворение', en: 'satisfaction' }],
    },
    {
      id: 6, title: 'Русская кухня', subtitle: 'Russian Cuisine', level: 'A2', topic: 'Food & Culture',
      paragraphs: [
        { french: 'Русская кухня богата и разнообразна. Борщ — суп со свёклой и капустой — известен во всём мире. Пельмени, блины и пироги — тоже традиционные блюда.', english: 'Russian cuisine is rich and varied. Borsch — a soup with beetroot and cabbage — is known worldwide. Pelmeni, blini and piroги are also traditional dishes.' },
        { french: 'На завтрак многие русские едят кашу — гречневую, овсяную или манную. Это сытно и полезно. К каше часто добавляют масло, молоко или варенье.', english: 'For breakfast many Russians eat porridge — buckwheat, oat or semolina. It is filling and healthy. Butter, milk or jam is often added to the porridge.' },
        { french: 'За столом принято говорить «приятного аппетита» перед едой. Гостей в России всегда угощают от всей души. «Ешьте, пожалуйста, не стесняйтесь» — это самая русская фраза.', english: 'At the table it is customary to say "bon appétit" before eating. Guests in Russia are always treated generously. "Please eat, don\'t be shy" — this is the most Russian phrase.' },
      ],
      vocab: [{ fr: 'борщ', en: 'borsch (beet soup)' }, { fr: 'пельмени', en: 'pelmeni (dumplings)' }, { fr: 'каша', en: 'porridge / grain dish' }, { fr: 'варенье', en: 'jam / preserve' }, { fr: 'угощать', en: 'to treat / to serve food' }],
    },
  ],

  Korean: [
    {
      id: 1, title: '서울에서 하루', subtitle: 'A Day in Seoul', level: 'A2', topic: 'Travel & City',
      paragraphs: [
        { french: '토요일 아침에 저는 경복궁에 갔어요. 날씨가 맑고 따뜻했어요. 궁궐은 정말 아름다웠어요.', english: 'On Saturday morning I went to Gyeongbokgung Palace. The weather was clear and warm. The palace was truly beautiful.' },
        { french: '점심에는 근처 식당에서 비빔밥을 먹었어요. 음식이 신선하고 맛있었어요. 가격도 저렴해서 좋았어요.', english: 'For lunch I ate bibimbap at a nearby restaurant. The food was fresh and delicious. The price was also affordable, which was nice.' },
        { french: '저녁에는 친구들을 만났어요. 우리는 한강 공원에서 산책했어요. 서울의 야경이 정말 멋있었어요.', english: 'In the evening I met my friends. We walked in Han River Park. The night view of Seoul was truly stunning.' },
      ],
      vocab: [{ fr: '경복궁', en: 'Gyeongbokgung Palace' }, { fr: '비빔밥', en: 'bibimbap (mixed rice dish)' }, { fr: '신선하다', en: 'to be fresh' }, { fr: '저렴하다', en: 'to be affordable/cheap' }, { fr: '야경', en: 'night view' }],
    },
    {
      id: 2, title: '우리 가족', subtitle: 'My Family', level: 'A1', topic: 'Family & Home',
      paragraphs: [
        { french: '저는 네 명의 가족이 있어요. 아버지, 어머니, 언니, 그리고 저예요. 우리는 부산에서 살아요.', english: 'I have a family of four. Father, mother, older sister, and me. We live in Busan.' },
        { french: '아버지는 회사에서 일해요. 어머니는 선생님이에요. 언니는 대학교에 다녀요. 저는 고등학교 학생이에요.', english: 'My father works at a company. My mother is a teacher. My older sister goes to university. I am a high school student.' },
        { french: '저녁마다 우리 가족은 함께 식사해요. 어머니가 요리해 주시고 우리는 그날 있었던 일을 이야기해요. 이 시간이 제가 가장 좋아하는 시간이에요.', english: 'Every evening our family eats together. Mother cooks for us and we talk about what happened that day. This is my favourite time of day.' },
      ],
      vocab: [{ fr: '가족', en: 'family' }, { fr: '아버지', en: 'father' }, { fr: '어머니', en: 'mother' }, { fr: '언니', en: 'older sister (female speaker)' }, { fr: '식사', en: 'meal' }],
    },
    {
      id: 3, title: '한국 음식 문화', subtitle: 'Korean Food Culture', level: 'A2', topic: 'Food & Culture',
      paragraphs: [
        { french: '한국 음식은 세계적으로 유명해요. 특히 김치, 불고기, 삼겹살이 인기 있어요. 한국인들은 매운 음식을 많이 먹어요.', english: 'Korean food is famous worldwide. Kimchi, bulgogi, and samgyeopsal are especially popular. Koreans eat a lot of spicy food.' },
        { french: '식사할 때 한국인들은 밥과 여러 가지 반찬을 함께 먹어요. 반찬은 작은 접시에 담겨 나와요. 국물 요리도 중요한 부분이에요.', english: 'When eating, Koreans eat rice together with various side dishes. Side dishes come on small plates. Soup dishes are also an important part.' },
        { french: '한국에서는 식사 전에 "잘 먹겠습니다"라고 말해요. 식사 후에는 "잘 먹었습니다"라고 해요. 이것은 음식과 요리한 사람에 대한 감사를 나타내요.', english: 'In Korea you say "jal meokgesseumnida" before a meal. After eating you say "jal meogeosseumnida". This expresses gratitude for the food and the person who cooked it.' },
      ],
      vocab: [{ fr: '김치', en: 'kimchi (fermented cabbage)' }, { fr: '불고기', en: 'bulgogi (marinated beef)' }, { fr: '반찬', en: 'side dishes' }, { fr: '매운', en: 'spicy' }, { fr: '감사', en: 'gratitude' }],
    },
    {
      id: 4, title: 'K-팝과 한류', subtitle: 'K-pop and the Korean Wave', level: 'B1', topic: 'Culture',
      paragraphs: [
        { french: 'K-팝은 전 세계에서 엄청난 인기를 얻고 있어요. BTS, BLACKPINK 같은 그룹들이 세계 음악 차트에서 1위를 차지했어요.', english: 'K-pop is gaining enormous popularity worldwide. Groups like BTS and BLACKPINK have topped global music charts.' },
        { french: '한류는 음악뿐만 아니라 드라마, 영화, 음식, 패션까지 포함해요. 특히 넷플릭스에서 한국 드라마가 많이 시청되고 있어요.', english: 'The Korean Wave includes not only music but also dramas, films, food and fashion. Korean dramas are particularly widely watched on Netflix.' },
        { french: '많은 외국인들이 K-팝 때문에 한국어를 배우기 시작했어요. 한국 문화에 관심을 갖는 사람들이 점점 늘고 있어요. 이것은 한국에 매우 좋은 현상이에요.', english: 'Many foreigners have started learning Korean because of K-pop. More and more people are showing interest in Korean culture. This is a very positive phenomenon for Korea.' },
      ],
      vocab: [{ fr: '한류', en: 'Korean Wave' }, { fr: '차트', en: 'chart' }, { fr: '드라마', en: 'TV drama' }, { fr: '패션', en: 'fashion' }, { fr: '현상', en: 'phenomenon' }],
    },
    {
      id: 5, title: '대중교통 이용하기', subtitle: 'Using Public Transport', level: 'A2', topic: 'Travel',
      paragraphs: [
        { french: '서울의 대중교통은 매우 편리해요. 지하철, 버스, 택시가 잘 연결되어 있어요. 교통카드 하나로 모든 교통수단을 이용할 수 있어요.', english: 'Public transport in Seoul is very convenient. The subway, buses and taxis are well connected. You can use all transport with just one transit card.' },
        { french: '지하철역에는 영어 안내도 있어요. 그래서 외국인도 쉽게 이용할 수 있어요. 지하철은 보통 정시에 출발하고 도착해요.', english: 'Subway stations also have English signage. So foreigners can use them easily too. Subways usually depart and arrive on time.' },
        { french: '버스는 지하철보다 더 많은 곳에 갈 수 있어요. 하지만 교통 체증이 있을 때는 시간이 더 걸려요. 그래서 급할 때는 지하철이 더 좋아요.', english: 'Buses can reach more places than the subway. But when there is traffic congestion it takes more time. So when you are in a hurry the subway is better.' },
      ],
      vocab: [{ fr: '대중교통', en: 'public transport' }, { fr: '교통카드', en: 'transit card' }, { fr: '지하철역', en: 'subway station' }, { fr: '정시', en: 'on time' }, { fr: '교통 체증', en: 'traffic congestion' }],
    },
  ],
};

function buildReading(langName) {
  const articles = READING_ARTICLES[langName] ?? [];
  return {
    meta: {
      title: 'Reading',
      subtitle: `Graded ${langName} texts with English side by side — hover highlighted words for pronunciation.`,
    },
    articles,
  };
}

const GRAMMAR_DATA = {
  Kazakh: {
    meta: { title: 'Grammar', subtitle: 'Kazakh vowel harmony, cases, word order, and verbs — with English notes.', accent: 'teal' },
    sections: [
      { id: 'intro', number: 1, title: 'Overview', blocks: [
        { type: 'paragraph', text: 'Kazakh is a Turkic language. It uses <strong>vowel harmony</strong> (suffixes change their vowels to match the root) and is <strong>agglutinative</strong> — grammatical meanings are stacked as suffixes.' },
        { type: 'callout', variant: 'compare-en', text: '🇬🇧 English: I go to school. Kazakh: Мен мектепке <em>барамын</em> (lit. I school-to go-I). The verb comes last; the subject is often dropped.' },
      ]},
      { id: 'pronouns', number: 2, title: 'Personal pronouns', blocks: [
        { type: 'table', headers: ['Kazakh', 'English', 'Notes'], rows: [
          ['мен', 'I', 'often dropped in speech'], ['сен', 'you (informal)', 'used with friends/children'], ['сіз', 'you (formal)', 'polite or plural'],
          ['ол', 'he / she / it', 'one word for all genders'], ['біз', 'we', ''], ['сендер', 'you (pl. informal)', ''], ['олар', 'they', ''],
        ]},
      ]},
      { id: 'harmony', number: 3, title: 'Vowel harmony', blocks: [
        { type: 'paragraph', text: 'Kazakh vowels are divided into <strong>back</strong> (а, о, ұ, ы) and <strong>front</strong> (е, ө, ү, і). Suffixes match the vowel type of the root.' },
        { type: 'table', headers: ['Root', 'Meaning', 'Locative (back)', 'Locative (front)'], rows: [
          ['үй', 'house', '—', 'үйде (at home)'], ['мектеп', 'school', '—', 'мектепте (at school)'], ['қала', 'city', 'қалада (in the city)', '—'],
        ]},
        { type: 'callout', variant: 'tip', text: 'Tip: Learn roots with their vowel class. After а/о/ұ/ы use back suffixes; after е/ө/ү/і use front suffixes.' },
      ]},
      { id: 'cases', number: 4, title: 'Cases (7)', blocks: [
        { type: 'paragraph', text: 'Kazakh has 7 cases shown by suffixes. The most important ones for beginners:' },
        { type: 'table', headers: ['Case', 'Suffix (back/front)', 'Use', 'Example'], rows: [
          ['Nominative', '—', 'subject', 'Кітап (book)'], ['Accusative', '-ны / -ні', 'direct object', 'Кітапты оқыдым (read the book)'],
          ['Dative', '-ға / -ге', 'to / for', 'Мектепке барды (went to school)'], ['Locative', '-да / -де', 'at / in', 'Үйде (at home)'],
          ['Ablative', '-дан / -ден', 'from', 'Алматыдан (from Almaty)'],
        ]},
      ]},
      { id: 'questions', number: 5, title: 'Questions & negation', blocks: [
        { type: 'paragraph', text: 'Yes/no questions add <code>ма/ме/ба/бе/па/пе</code> after the verb. Question words: <em>не</em> (what), <em>кім</em> (who), <em>қайда</em> (where), <em>қашан</em> (when), <em>неге</em> (why), <em>қалай</em> (how).' },
        { type: 'example', fr: 'Сіз қазақша сөйлейсіз бе?', en: 'Do you speak Kazakh?' },
        { type: 'example', fr: 'Мен қазақша сөйлемеймін.', en: 'I do not speak Kazakh.' },
        { type: 'callout', variant: 'tip', text: 'Negation: add <strong>-ма/-ме</strong> before the personal suffix: сөйле-ме-ймін (speak-NEG-I).' },
      ]},
      { id: 'verbs', number: 6, title: 'Present tense verbs', blocks: [
        { type: 'paragraph', text: 'The present-continuous tense uses <strong>-а/-е + personal suffix</strong>. The stem drops its infinitive suffix <em>-у/-ю</em>.' },
        { type: 'table', headers: ['Person', 'барамын (I go)', 'жейсің (you eat)', 'оқиды (he reads)'], rows: [
          ['мен (I)', 'барамын', 'жеймін', 'оқимын'], ['сен (you inf)', 'барасың', 'жейсің', 'оқисың'],
          ['сіз (you form)', 'барасыз', 'жейсіз', 'оқисыз'], ['ол (he/she)', 'барады', 'жейді', 'оқиды'],
          ['біз (we)', 'барамыз', 'жейміз', 'оқимыз'], ['олар (they)', 'барады', 'жейді', 'оқиды'],
        ]},
      ]},
    ],
  },

  Russian: {
    meta: { title: 'Grammar', subtitle: 'Russian cases, gender, verb conjugation, and word order — with English notes.', accent: 'sky' },
    sections: [
      { id: 'intro', number: 1, title: 'Overview', blocks: [
        { type: 'paragraph', text: 'Russian uses the Cyrillic alphabet and has <strong>six cases</strong>. Nouns carry grammatical gender (masculine, feminine, neuter) and adjectives agree with nouns in gender, number, and case.' },
        { type: 'callout', variant: 'compare-en', text: '🇬🇧 English relies on word order. Russian uses case endings, so word order is flexible: <em>Я вижу кошку</em> and <em>Кошку я вижу</em> both mean "I see the cat".' },
      ]},
      { id: 'gender', number: 2, title: 'Noun gender', blocks: [
        { type: 'paragraph', text: 'Most nouns ending in a consonant are <strong>masculine</strong>; in <em>-а/-я</em> are <strong>feminine</strong>; in <em>-о/-е</em> are <strong>neuter</strong>. There are exceptions — learn gender with each noun.' },
        { type: 'table', headers: ['Gender', 'Ending', 'Example', 'English'], rows: [
          ['Masculine', 'consonant', 'стол', 'table'], ['Feminine', '-а / -я', 'книга', 'book'],
          ['Neuter', '-о / -е', 'окно', 'window'], ['Exceptions', 'varies', 'путь (м), мать (ж)', 'path, mother'],
        ]},
      ]},
      { id: 'cases', number: 3, title: 'The six cases', blocks: [
        { type: 'table', headers: ['Case', 'Use', 'Question', 'Example'], rows: [
          ['Nominative', 'subject', 'кто? что?', 'Книга (the book)'], ['Accusative', 'direct object', 'кого? что?', 'Читаю книгу'],
          ['Genitive', 'of / absence / quantity', 'кого? чего?', 'Нет книги (no book)'], ['Dative', 'to / for', 'кому? чему?', 'Дал книге (gave to the book)'],
          ['Instrumental', 'with / by means of', 'кем? чем?', 'С книгой (with the book)'], ['Prepositional', 'about / location', 'о ком? о чём?', 'О книге (about the book)'],
        ]},
      ]},
      { id: 'pronouns', number: 4, title: 'Personal pronouns', blocks: [
        { type: 'table', headers: ['Russian', 'English', 'Formal?'], rows: [
          ['я', 'I', ''], ['ты', 'you', 'informal'], ['вы', 'you', 'formal or plural'],
          ['он', 'he', ''], ['она', 'she', ''], ['оно', 'it', ''], ['мы', 'we', ''], ['они', 'they', ''],
        ]},
      ]},
      { id: 'verbs', number: 5, title: 'Verb conjugation', blocks: [
        { type: 'paragraph', text: 'Russian verbs have two conjugation patterns. <strong>Type 1</strong> (-ать/-ять endings in infinitive) and <strong>Type 2</strong> (-ить/-еть). Learn the я and ты forms first.' },
        { type: 'table', headers: ['Person', 'читать (to read)', 'говорить (to speak)'], rows: [
          ['я', 'читаю', 'говорю'], ['ты', 'читаешь', 'говоришь'], ['он/она', 'читает', 'говорит'],
          ['мы', 'читаем', 'говорим'], ['вы', 'читаете', 'говорите'], ['они', 'читают', 'говорят'],
        ]},
      ]},
      { id: 'questions', number: 6, title: 'Questions & negation', blocks: [
        { type: 'paragraph', text: 'Yes/no questions use rising intonation (no word change needed). Question words: <em>кто</em> (who), <em>что</em> (what), <em>где</em> (where), <em>куда</em> (where to), <em>когда</em> (when), <em>почему</em> (why), <em>как</em> (how), <em>сколько</em> (how much/many).' },
        { type: 'example', fr: 'Вы говорите по-русски?', en: 'Do you speak Russian?' },
        { type: 'example', fr: 'Я не говорю по-русски.', en: 'I do not speak Russian.' },
        { type: 'callout', variant: 'tip', text: 'Negation: place <strong>не</strong> directly before the verb: <em>Я не знаю</em> (I don\'t know). Double negatives are standard: <em>Никто ничего не знает</em> (Nobody knows anything).' },
      ]},
    ],
  },

  Korean: {
    meta: { title: 'Grammar', subtitle: 'Korean honorifics, sentence structure, particles, and verb endings — with English notes.', accent: 'rose' },
    sections: [
      { id: 'intro', number: 1, title: 'Overview', blocks: [
        { type: 'paragraph', text: 'Korean is an agglutinative language with <strong>Subject–Object–Verb</strong> word order. Verbs always come last. Korean has an extensive <strong>honorific system</strong> — speech level changes depending on who you talk to.' },
        { type: 'callout', variant: 'compare-en', text: '🇬🇧 English: I eat rice. Korean: 저는 밥을 먹어요 (I-topic rice-object eat-polite). Particles attached to nouns show their grammatical role.' },
      ]},
      { id: 'particles', number: 2, title: 'Key particles', blocks: [
        { type: 'table', headers: ['Particle', 'After consonant', 'After vowel', 'Use'], rows: [
          ['Topic', '은', '는', 'marks the topic / contrast'], ['Subject', '이', '가', 'marks the subject'],
          ['Object', '을', '를', 'marks the direct object'], ['Location', '에', '에', 'at / in / to (direction)'],
          ['With', '과', '와', 'and / with'], ['From', '에서', '에서', 'from / at (action location)'],
        ]},
        { type: 'example', fr: '저는 학생이에요.', en: 'I am a student. (저=I, 는=topic, 학생=student, 이에요=am)' },
      ]},
      { id: 'pronouns', number: 3, title: 'Personal pronouns', blocks: [
        { type: 'table', headers: ['Korean', 'English', 'Register'], rows: [
          ['저', 'I', 'formal/humble'], ['나', 'I', 'informal'], ['당신', 'you', 'formal (rarely used)'],
          ['씨 (name+씨)', 'you', 'polite (use name)'], ['그/그녀', 'he/she', 'mostly in writing'],
          ['우리', 'we / our', 'very common (e.g. 우리 집 = my house)'], ['그들', 'they', 'formal/literary'],
        ]},
        { type: 'callout', variant: 'tip', text: 'In Korean conversation, subject pronouns are usually dropped. Koreans often use "우리" (we/our) even for personal things: 우리 엄마 = "my mum".' },
      ]},
      { id: 'speech_levels', number: 4, title: 'Speech levels', blocks: [
        { type: 'paragraph', text: 'Korean has multiple speech levels. Beginners should focus on two:' },
        { type: 'table', headers: ['Level', 'Verb ending', 'Use'], rows: [
          ['Polite informal (해요체)', '-아요 / -어요', 'everyday polite speech with strangers and adults'],
          ['Formal polite (합쇼체)', '-(스)ㅂ니다', 'business, presentations, formal situations'],
          ['Casual (반말)', '-아 / -어', 'close friends, younger people (use carefully!)'],
        ]},
        { type: 'example', fr: '먹어요 → 먹습니다 → 먹어', en: 'eat (polite) → eat (formal) → eat (casual)' },
      ]},
      { id: 'verbs', number: 5, title: 'Verb conjugation basics', blocks: [
        { type: 'paragraph', text: 'Korean verb stems are found by removing <strong>-다</strong> from the dictionary form. Add <strong>-아요</strong> after stems ending in ㅏ/ㅗ, otherwise <strong>-어요</strong>.' },
        { type: 'table', headers: ['Infinitive', 'Stem', 'Polite present', 'English'], rows: [
          ['가다', '가', '가요', 'to go'], ['먹다', '먹', '먹어요', 'to eat'], ['마시다', '마시', '마셔요', 'to drink'],
          ['공부하다', '공부하', '공부해요', 'to study'], ['있다', '있', '있어요', 'to exist / to have'],
        ]},
      ]},
      { id: 'questions', number: 6, title: 'Questions & negation', blocks: [
        { type: 'paragraph', text: 'Questions in polite speech end with <strong>-요?</strong> (rising intonation). Question words: 누구 (who), 무엇/뭐 (what), 어디 (where), 언제 (when), 왜 (why), 어떻게 (how), 얼마 (how much).' },
        { type: 'example', fr: '한국어를 배워요?', en: 'Are you learning Korean?' },
        { type: 'example', fr: '저는 한국어를 못 해요.', en: 'I cannot speak Korean well.' },
        { type: 'callout', variant: 'tip', text: 'Two negation patterns: <strong>안 + verb</strong> (simple "not") and <strong>verb stem + 지 않아요</strong> (emphatic "not"). 안 가요 = 가지 않아요 (I don\'t go).' },
      ]},
    ],
  },
};

function buildGrammar(langName) {
  return GRAMMAR_DATA[langName] ?? GRAMMAR_DATA.Korean;
}

const PRONUNCIATION_DATA = {
  Kazakh: {
    meta: { title: 'Sounds', subtitle: 'Kazakh Cyrillic special letters, vowel harmony, and key pronunciation rules.', accent: 'teal' },
    sections: [
      { id: 'alphabet', number: 1, title: 'Kazakh Cyrillic special letters', blocks: [
        { type: 'paragraph', text: 'Kazakh Cyrillic adds 9 letters not in Russian: <strong>ә Ә, ғ Ғ, қ Қ, ң Ң, ө Ө, ұ Ұ, ү Ү, h Н, і І</strong>.' },
        { type: 'table', headers: ['Letter', 'Sound', 'Tip'], rows: [
          ['ә', 'open e', 'like "a" in "cat"'], ['ғ', 'voiced uvular', 'like a French/Arabic "gh"'],
          ['қ', 'uvular k', 'further back than Russian к'], ['ң', 'ng', 'like "ng" in "sing"'],
          ['ө', 'rounded front o', 'like German ö or French eu'], ['ұ', 'back u', 'like "oo" but unrounded'],
          ['ү', 'front u', 'like German ü or French u'], ['і', 'high central i', 'shorter than Russian и'],
        ]},
      ]},
      { id: 'harmony', number: 2, title: 'Vowel harmony in speech', blocks: [
        { type: 'paragraph', text: 'When speaking, all vowels in a word (root + suffixes) harmonise. Back vowels (а, о, ұ, ы) attract back suffixes; front vowels (е, ө, ү, і) attract front suffixes.' },
        { type: 'example', fr: 'бала → балаға (back)', en: 'child → to the child (back suffix)' },
        { type: 'example', fr: 'үй → үйге (front)', en: 'house → to the house (front suffix)' },
      ]},
      { id: 'tips', number: 3, title: 'Pronunciation tips', blocks: [
        { type: 'list', items: [
          'Roll or lightly tap /р/ — similar to Spanish r', 'Қ is deeper in the throat than к; practice separately',
          'Н before a vowel at word start is pronounced like English n', 'Word stress generally falls on the last syllable',
          'Use 🔊 on every word in Vocab and Reading to train your ear',
        ]},
      ]},
      { id: 'common', number: 4, title: 'Common sound pairs', blocks: [
        { type: 'table', headers: ['Kazakh', 'Sounds like', 'Contrast with Russian'], rows: [
          ['к', 'k (front vowels)', 'same as Russian к before front vowels'], ['қ', 'q (back, uvular)', 'does not exist in Russian'],
          ['г', 'g', 'same'], ['ғ', 'gh (voiced uvular)', 'does not exist in Russian'],
          ['з', 'z', 'same'], ['с', 's', 'same — never "sh"'],
        ]},
      ]},
    ],
  },

  Russian: {
    meta: { title: 'Sounds', subtitle: 'Russian vowel reduction, consonant softening, stress, and the Cyrillic alphabet.', accent: 'sky' },
    sections: [
      { id: 'alphabet', number: 1, title: 'Cyrillic alphabet', blocks: [
        { type: 'paragraph', text: 'Russian has 33 letters — 10 vowels, 21 consonants, and 2 signs (ь ъ). Most letters are consistent, but stress (which syllable is strong) is unpredictable and must be memorised.' },
        { type: 'table', headers: ['Letter', 'Name', 'Sounds like'], rows: [
          ['А а', 'a', '"a" in "father"'], ['Е е', 'ye', '"ye" in "yet" (stressed) or "i" (unstressed)'],
          ['Ё ё', 'yo', '"yo" in "yoke" — always stressed'], ['И и', 'i', '"ee" in "see"'],
          ['О о', 'o', '"o" in "note" (stressed) or "a" (unstressed)'], ['У у', 'u', '"oo" in "boot"'],
          ['Ы ы', 'y', 'no English equivalent — between "i" and "u"'], ['Э э', 'e', '"e" in "echo"'],
          ['Ю ю', 'yu', '"yu" in "yule"'], ['Я я', 'ya', '"ya" in "yard"'],
        ]},
      ]},
      { id: 'reduction', number: 2, title: 'Vowel reduction', blocks: [
        { type: 'paragraph', text: 'Unstressed <strong>о</strong> sounds like <em>a</em>, and unstressed <strong>е/я</strong> reduce to <em>i</em>. This is called <strong>vowel reduction</strong> and is crucial for natural Russian.' },
        { type: 'table', headers: ['Written', 'Pronounced', 'English'], rows: [
          ['молоко', 'malaKO', 'milk (stress on last о)'], ['хорошо', 'haraShO', 'good / fine'],
          ['говорить', 'gavaRIT\'', 'to speak'], ['сегодня', 'siVODnya', 'today'],
        ]},
      ]},
      { id: 'soft', number: 3, title: 'Hard vs soft consonants', blocks: [
        { type: 'paragraph', text: 'Most Russian consonants have a <strong>soft (palatalised)</strong> variant — pronounced with the tongue raised toward the palate. The soft sign <strong>ь</strong> marks softness. Before е, ё, и, ю, я consonants are automatically soft.' },
        { type: 'example', fr: 'брат (brother) vs брать (to take)', en: 'Hard т vs soft тЬ — one letter changes the meaning completely.' },
        { type: 'callout', variant: 'tip', text: 'Practice pairs: мат/мать, брат/брать, ест/есть. The soft sign changes both pronunciation and meaning.' },
      ]},
      { id: 'tips', number: 4, title: 'Pronunciation tips', blocks: [
        { type: 'list', items: [
          'Always mark stress when you learn a new word', 'Reduce unstressed о → а, е/я → и',
          'Roll the р (trilled r) — practice with "trр-р-р"', 'Щ sounds like an extended "shsh" (like English "fresh cheese" run together)',
          'Х is like the "ch" in Scottish "loch" — a throaty sound', 'Use 🔊 on every word to build listening intuition',
        ]},
      ]},
    ],
  },

  Korean: {
    meta: { title: 'Sounds', subtitle: 'Hangul script, vowels, consonants, final consonants, and key pronunciation rules.', accent: 'rose' },
    sections: [
      { id: 'hangul', number: 1, title: 'How Hangul works', blocks: [
        { type: 'paragraph', text: 'Korean is written in <strong>Hangul</strong> — a featural alphabet invented in 1443. Characters are grouped into syllable blocks: each block has an initial consonant + vowel + optional final consonant.' },
        { type: 'example', fr: '한 = ㅎ + ㅏ + ㄴ', en: 'h + a + n → syllable "han"' },
        { type: 'callout', variant: 'tip', text: 'Hangul can be learned in about 2–3 hours. It is perfectly phonetic — once you know the letters you can read any Korean word.' },
      ]},
      { id: 'vowels', number: 2, title: 'Vowels (모음)', blocks: [
        { type: 'table', headers: ['Hangul', 'Sound', 'Like...'], rows: [
          ['ㅏ', 'a', '"a" in father'], ['ㅓ', 'eo', '"u" in cup (rounded)'], ['ㅗ', 'o', '"o" in more'],
          ['ㅜ', 'u', '"oo" in book'], ['ㅡ', 'eu', 'no English equivalent — unrounded back vowel'], ['ㅣ', 'i', '"ee" in see'],
          ['ㅐ', 'ae', '"e" in bed'], ['ㅔ', 'e', '"e" in bed (same as ㅐ in modern speech)'],
          ['ㅑ', 'ya', '"ya" in yard'], ['ㅕ', 'yeo', '"yuh"'], ['ㅛ', 'yo', '"yo" in yoga'], ['ㅠ', 'yu', '"you"'],
        ]},
      ]},
      { id: 'consonants', number: 3, title: 'Consonants (자음)', blocks: [
        { type: 'paragraph', text: 'Korean has three series of consonants: <strong>lax</strong>, <strong>aspirated</strong> (h-puff of air), and <strong>tense</strong> (no air). These contrasts change meaning.' },
        { type: 'table', headers: ['Lax', 'Aspirated', 'Tense', 'Sounds'], rows: [
          ['ㄱ g/k', 'ㅋ k\'', 'ㄲ kk', 'k-series'], ['ㄷ d/t', 'ㅌ t\'', 'ㄸ tt', 't-series'],
          ['ㅂ b/p', 'ㅍ p\'', 'ㅃ pp', 'p-series'], ['ㅈ j', 'ㅊ ch\'', 'ㅉ jj', 'ch-series'],
          ['ㅅ s', '—', 'ㅆ ss', 's-series'],
        ]},
        { type: 'example', fr: '달 (moon) vs 탈 (mask) vs 딸 (daughter)', en: 'Lax ㄷ vs aspirated ㅌ vs tense ㄸ' },
      ]},
      { id: 'final', number: 4, title: 'Final consonants (받침)', blocks: [
        { type: 'paragraph', text: 'A consonant at the bottom of a syllable block is called <em>batchim</em>. Only 7 sounds are actually pronounced in final position, regardless of how the letter looks.' },
        { type: 'list', items: ['ㄱ, ㅋ, ㄲ → all sound like "k"', 'ㄴ → "n"', 'ㄷ, ㅅ, ㅆ, ㅈ, ㅊ, ㅎ, ㅌ → all sound like "t"', 'ㄹ → "l"', 'ㅁ → "m"', 'ㅂ, ㅍ → "p"', 'ㅇ → "ng"'] },
        { type: 'callout', variant: 'tip', text: 'When a final consonant is followed by a vowel, it links to the next syllable: 한국어 → [한구거] (hangukeO).' },
      ]},
      { id: 'tips', number: 5, title: 'Pronunciation tips', blocks: [
        { type: 'list', items: [
          'Learn to distinguish the three consonant series (lax/aspirated/tense) — they change meaning',
          'ㅡ (eu) has no English equivalent — practice with 으 and 큰 (big)',
          'The ㄹ sound is between English r and l; tap lightly at the front of the mouth',
          'Word-final consonants are "unreleased" — you feel them but do not burst',
          'Use 🔊 on every word — Korean sound rules become natural with listening practice',
        ]},
      ]},
    ],
  },
};

function buildPronunciation(langName) {
  return PRONUNCIATION_DATA[langName] ?? PRONUNCIATION_DATA.Korean;
}

const QUESTION_PHRASES = {
  Kazakh: [
    { french: 'Бұл не?', english: 'What is this?' },
    { french: 'Сіз қайда тұрасыз?', english: 'Where do you live?' },
    { french: 'Қашан барасыз?', english: 'When are you going?' },
    { french: 'Неге?', english: 'Why?' },
    { french: 'Кім?', english: 'Who?' },
    { french: 'Бұл қалай айтылады?', english: 'How do you say this?' },
    { french: 'Сіз қандай жұмыс жасайсыз?', english: 'What work do you do?' },
    { french: 'Бұл қанша тұрады?', english: 'How much does this cost?' },
    { french: 'Мейрамхана қайда?', english: 'Where is the restaurant?' },
    { french: 'Дәретхана қайда?', english: 'Where is the toilet?' },
  ],
  Russian: [
    { french: 'Что это?', english: 'What is this?' },
    { french: 'Где вы живёте?', english: 'Where do you live?' },
    { french: 'Когда вы идёте?', english: 'When are you going?' },
    { french: 'Почему?', english: 'Why?' },
    { french: 'Кто?', english: 'Who?' },
    { french: 'Как это сказать?', english: 'How do you say this?' },
    { french: 'Чем вы занимаетесь?', english: 'What do you do for work?' },
    { french: 'Сколько это стоит?', english: 'How much does this cost?' },
    { french: 'Где ресторан?', english: 'Where is the restaurant?' },
    { french: 'Где туалет?', english: 'Where is the toilet?' },
  ],
  Korean: [
    { french: '이것은 뭐예요?', english: 'What is this?' },
    { french: '어디에 사세요?', english: 'Where do you live?' },
    { french: '언제 가세요?', english: 'When are you going?' },
    { french: '왜요?', english: 'Why?' },
    { french: '누구예요?', english: 'Who is it?' },
    { french: '이것을 어떻게 말해요?', english: 'How do you say this?' },
    { french: '무슨 일을 하세요?', english: 'What do you do for work?' },
    { french: '얼마예요?', english: 'How much is it?' },
    { french: '식당이 어디예요?', english: 'Where is the restaurant?' },
    { french: '화장실이 어디예요?', english: 'Where is the toilet?' },
  ],
};

const SOCIAL_PHRASES = {
  Kazakh: [
    { french: 'Маған ... ұнайды.', english: 'I like ...' },
    { french: 'Мен ... тілеймін.', english: 'I wish ...' },
    { french: 'Бұл өте жақсы!', english: 'This is very good!' },
    { french: 'Мен сізбен келісемін.', english: 'I agree with you.' },
    { french: 'Ойым басқаша.', english: 'I think differently.' },
    { french: 'Сіздің пікіріңіз қандай?', english: 'What is your opinion?' },
    { french: 'Маған уақыт керек.', english: 'I need time.' },
    { french: 'Тамаша!', english: 'Excellent!' },
    { french: 'Мен сізді жақсы түсіндім.', english: 'I understood you well.' },
    { french: 'Айтқандарыңызға рахмет.', english: 'Thank you for what you said.' },
  ],
  Russian: [
    { french: 'Мне нравится ...', english: 'I like ...' },
    { french: 'Я желаю ...', english: 'I wish ...' },
    { french: 'Это очень хорошо!', english: 'This is very good!' },
    { french: 'Я с вами согласен.', english: 'I agree with you.' },
    { french: 'Я думаю иначе.', english: 'I think differently.' },
    { french: 'Каково ваше мнение?', english: 'What is your opinion?' },
    { french: 'Мне нужно время.', english: 'I need time.' },
    { french: 'Замечательно!', english: 'Excellent!' },
    { french: 'Я вас хорошо понял.', english: 'I understood you well.' },
    { french: 'Спасибо за ваши слова.', english: 'Thank you for what you said.' },
  ],
  Korean: [
    { french: '저는 ...을/를 좋아해요.', english: 'I like ...' },
    { french: '저는 ...을/를 원해요.', english: 'I want ...' },
    { french: '정말 좋아요!', english: 'This is really good!' },
    { french: '동의해요.', english: 'I agree.' },
    { french: '저는 다르게 생각해요.', english: 'I think differently.' },
    { french: '어떻게 생각하세요?', english: 'What do you think?' },
    { french: '시간이 필요해요.', english: 'I need time.' },
    { french: '훌륭해요!', english: 'Excellent!' },
    { french: '잘 이해했어요.', english: 'I understood well.' },
    { french: '말씀해 주셔서 감사해요.', english: 'Thank you for what you said.' },
  ],
};

function buildSpeaking(words, langName) {
  const nativeLabelMap = { Kazakh: ['Негіздер', 'Сұрақтар', 'Қарым-қатынас', 'Нұсқаулар'], Russian: ['Основы', 'Вопросы', 'Общение', 'Инструкции'], Korean: ['기초', '질문', '대화', '안내'] };
  const [labBasics, labQ, labSocial, labDir] = nativeLabelMap[langName] ?? ['Basics', 'Questions', 'Social', 'Directions'];
  const questions = (QUESTION_PHRASES[langName] ?? []).map((s, i) => ({ id: i + 1, ...s }));
  const social = (SOCIAL_PHRASES[langName] ?? []).map((s, i) => ({ id: i + 1, ...s }));

  const sections = [
    {
      id: 'basics', label: 'Basics', frenchLabel: labBasics, description: 'Essential everyday words and phrases.',
      sentences: words.slice(0, 30).map((w, i) => ({ id: i + 1, french: w.word, english: w.english })),
    },
    { id: 'questions', label: 'Questions', frenchLabel: labQ, description: 'Asking for help, directions, and information.', sentences: questions },
    { id: 'social', label: 'Social', frenchLabel: labSocial, description: 'Friendly conversation phrases.', sentences: social },
    {
      id: 'vocab', label: 'More words', frenchLabel: labDir, description: 'Extended vocabulary for speaking practice.',
      sentences: words.slice(30, 60).map((w, i) => ({ id: i + 1, french: w.word, english: w.english })),
    },
  ];
  return { meta: { subtitle: `${langName} phrases for speaking practice — tap 🔊 to hear each line.` }, sections };
}

function buildTrack(lang, entries, langName) {
  const dir = ensureDir(lang);
  const sortedEntries = sortByLearning(entries);
  const words = toWordPairs(sortedEntries, lang);
  writePool(dir, lang, langName, words);

  writeFileSync(join(dir, 'sentences.json'), JSON.stringify(buildSentences(sortedEntries, langName), null, 2));
  writeFileSync(join(dir, 'topics.json'), JSON.stringify({ topics: assignTopics(sortedEntries, langName) }, null, 2));
  writeFileSync(join(dir, 'reading-articles.json'), JSON.stringify(buildReading(langName), null, 2));
  writeFileSync(join(dir, 'guide-grammar.json'), JSON.stringify(buildGrammar(langName), null, 2));
  writeFileSync(join(dir, 'guide-pronunciation.json'), JSON.stringify(buildPronunciation(langName), null, 2));
  writeFileSync(join(dir, 'speaking-sentences.json'), JSON.stringify(buildSpeaking(sortedEntries, langName), null, 2));

  console.log(`${langName}: ${words.length} words → shared/data/${lang}/`);
}

buildTrack('kazakh', kazakhWords, 'Kazakh');
buildTrack('russian', russianWords, 'Russian');
buildTrack('korean', koreanWords, 'Korean');
console.log('Done.');
