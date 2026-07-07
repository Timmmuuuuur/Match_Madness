/**
 * Duolingo-style lexicon tier ordering.
 * Words are bucketed by learning relevance (survival → grammar → daily life → expansion)
 * rather than raw corpus frequency. Within each tier the original index (which reflects
 * frequency) is used as a tiebreaker, so rare words stay at the back.
 */

const TIERS = [
  { id: 'greetings',   keywords: ['hello', 'hi', 'goodbye', 'bye', 'good morning', 'good evening', 'good night', 'good afternoon', 'good day', 'good night', 'thank', 'please', 'sorry', 'excuse', 'welcome', 'yes', 'no', 'okay', 'ok'] },
  { id: 'pronouns',    keywords: [' i ', ' you ', ' he ', ' she ', ' we ', ' they ', ' my ', ' your ', ' our ', ' his ', ' her ', ' me ', ' him ', ' us ', ' them ', ' its '] },
  { id: 'questions',   keywords: ['what', 'where', 'when', 'why', 'how', 'which', 'who', 'whose', 'how much', 'how many'] },
  { id: 'numbers',     keywords: ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'twenty', 'thirty', 'forty', 'fifty', 'hundred', 'thousand', 'first', 'second', 'third', 'half'] },
  { id: 'core_verbs',  keywords: [' be ', ' am ', ' is ', ' are ', ' was ', ' were ', 'have', 'has', 'had', ' go ', 'goes', 'went', 'come', 'came', 'see', 'saw', 'know', 'think', 'want', 'can ', 'could', 'must', 'should', 'would', ' do ', 'does', 'did', 'make', 'made', 'get', 'give', 'take', 'say', 'said', 'tell', 'speak', 'talk', 'listen', 'read', 'write', 'learn', 'eat', 'drink', 'sleep', 'live', 'work', 'study', 'play', 'buy', 'sell', 'pay', 'help', 'need', 'like', 'love', 'use', 'find', 'ask'] },
  { id: 'family',      keywords: ['mother', 'father', 'parent', 'brother', 'sister', 'son', 'daughter', 'child', 'baby', 'family', 'husband', 'wife', 'friend', 'grandmother', 'grandfather', 'uncle', 'aunt', 'cousin', 'relative'] },
  { id: 'home',        keywords: ['house', 'home', 'room', 'door', 'window', 'kitchen', 'bed', 'bathroom', 'table', 'chair', 'floor', 'wall', 'key', 'apartment', 'building', 'garden'] },
  { id: 'food',        keywords: ['food', 'water', 'bread', 'meat', 'fish', 'rice', 'fruit', 'apple', 'vegetable', 'coffee', 'tea', 'milk', 'sugar', 'salt', 'restaurant', 'menu', 'breakfast', 'lunch', 'dinner', 'meal', 'hungry', 'thirsty', 'cook', 'soup', 'egg'] },
  { id: 'time',        keywords: ['day', 'night', 'morning', 'evening', 'week', 'month', 'year', 'hour', 'minute', 'second', 'today', 'tomorrow', 'yesterday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'time', 'clock', 'calendar', 'date'] },
  { id: 'body',        keywords: ['head', 'face', 'eye', 'ear', 'nose', 'mouth', 'hand', 'foot', 'leg', 'arm', 'finger', 'heart', 'body', 'health', 'doctor', 'hospital', 'sick', 'pain', 'medicine', 'blood'] },
  { id: 'clothing',    keywords: ['clothes', 'shirt', 'pants', 'trousers', 'dress', 'shoe', 'hat', 'coat', 'wear', 'jacket', 'sock', 'skirt'] },
  { id: 'travel',      keywords: ['city', 'street', 'road', 'train', 'bus', 'car', 'taxi', 'airport', 'hotel', 'ticket', 'travel', 'trip', 'map', 'station', 'passport', 'left', 'right', 'north', 'south', 'east', 'west', 'direction', 'near', 'far', 'open', 'close', 'arrive', 'depart'] },
  { id: 'work_school', keywords: ['work', 'job', 'office', 'school', 'student', 'teacher', 'class', 'book', 'pen', 'paper', 'company', 'boss', 'meeting', 'university', 'exam', 'lesson', 'question', 'answer'] },
  { id: 'shopping',    keywords: ['shop', 'store', 'market', 'price', 'money', 'bank', 'cost', 'cheap', 'expensive', 'buy', 'sell', 'pay', 'card', 'cash'] },
  { id: 'nature',      keywords: ['sun', 'moon', 'star', 'sky', 'rain', 'snow', 'wind', 'weather', 'hot', 'cold', 'warm', 'tree', 'flower', 'river', 'sea', 'ocean', 'mountain', 'forest', 'animal', 'dog', 'cat', 'bird', 'water'] },
  { id: 'feelings',    keywords: ['happy', 'sad', 'angry', 'afraid', 'scared', 'tired', 'excited', 'bored', 'good', 'bad', 'beautiful', 'pretty', 'big', 'small', 'large', 'new', 'old', 'young', 'easy', 'hard', 'difficult', 'important', 'nice', 'fun', 'feel', 'emotion', 'funny', 'serious'] },
  { id: 'connectors',  keywords: ['and', 'but', 'or', 'because', 'with', 'without', 'for ', 'from', ' to ', ' in ', ' on ', ' at ', ' by ', 'before', 'after', 'very', 'also', 'too', 'not', 'never', 'always', 'sometimes', 'often', 'already', 'still', 'again', 'together', 'each', 'every'] },
];

function normalizeEn(text) {
  return ` ${String(text ?? '').toLowerCase().replace(/[^a-z0-9'\s-]/g, ' ')} `;
}

export function learningTier(english) {
  const en = normalizeEn(english);
  for (let i = 0; i < TIERS.length; i++) {
    if (TIERS[i].keywords.some((k) => en.includes(k))) return i;
  }
  return TIERS.length;
}

/**
 * Sort an array of { word, english } (or { french, english }) objects by learning tier.
 * Stable: original order used as tiebreaker within a tier.
 */
export function sortByLearning(entries) {
  return entries
    .map((entry, i) => ({ entry, i, tier: learningTier(entry.english ?? entry.en ?? '') }))
    .sort((a, b) => a.tier - b.tier || a.i - b.i)
    .map(({ entry }) => entry);
}
