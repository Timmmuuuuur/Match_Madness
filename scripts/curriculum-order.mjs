/**
 * Duolingo-style French curriculum order (A1 → B2).
 * Imported by scripts/build-topics.mjs — array index sets `order`.
 */
export const CURRICULUM_PATH = [
  // Unit 1 — A1 Survival
  { id: 'greetings-basics', unit: 1, level: 'A1' },
  { id: 'questions', unit: 1, level: 'A1' },
  { id: 'numbers', unit: 1, level: 'A1' },
  // Unit 2 — A1 Daily rhythm
  { id: 'days', unit: 2, level: 'A1' },
  { id: 'time-expressions', unit: 2, level: 'A1' },
  { id: 'dates-times', unit: 2, level: 'A1' },
  // Unit 3 — A1 People & places
  { id: 'family', unit: 3, level: 'A1' },
  { id: 'home', unit: 3, level: 'A1' },
  { id: 'city-directions', unit: 3, level: 'A1' },
  // Unit 4 — A1 Food & body
  { id: 'food-drink', unit: 4, level: 'A1' },
  { id: 'fruits-vegetables', unit: 4, level: 'A1' },
  { id: 'body', unit: 4, level: 'A1' },
  // Unit 5 — A1 Around town
  { id: 'colors', unit: 5, level: 'A1' },
  { id: 'clothing', unit: 5, level: 'A1' },
  { id: 'shopping-money', unit: 5, level: 'A1' },
  // Unit 6 — A2 School & work
  { id: 'school', unit: 6, level: 'A2' },
  { id: 'work', unit: 6, level: 'A2' },
  { id: 'common-verbs', unit: 6, level: 'A2' },
  // Unit 7 — A2 World & travel
  { id: 'travel', unit: 7, level: 'A2' },
  { id: 'countries-languages', unit: 7, level: 'A2' },
  { id: 'months-seasons', unit: 7, level: 'A2' },
  // Unit 8 — A2 Nature & hobbies
  { id: 'animals', unit: 8, level: 'A2' },
  { id: 'nature-weather', unit: 8, level: 'A2' },
  { id: 'sports-hobbies', unit: 8, level: 'A2' },
  // Unit 9 — A2 Feelings & description
  { id: 'emotions', unit: 9, level: 'A2' },
  { id: 'adjectives', unit: 9, level: 'A2' },
  { id: 'health', unit: 9, level: 'A2' },
  // Unit 10 — B1 Grammar glue
  { id: 'prepositions', unit: 10, level: 'B1' },
  { id: 'technology', unit: 10, level: 'B1' },
  { id: 'arts-music', unit: 10, level: 'B1' },
];

export const UNIT_LABELS = {
  1: 'Survival French',
  2: 'Daily rhythm',
  3: 'People & home',
  4: 'Food & body',
  5: 'Around town',
  6: 'School & work',
  7: 'Travel & calendar',
  8: 'Nature & hobbies',
  9: 'Feelings & health',
  10: 'B1 expansion',
};
