import { WORD_POOLS, POOL_SIZES } from './words.js';
import { SENTENCES } from './sentences.js';

const BEST_KEY        = 'match-madness-best';
const PAIRS_PER_ROUND = 5;
const TOTAL_ROUNDS    = 5;
const GAME_DURATION_S = 120; // words mode only

const state = {
  screen:   'home',
  mode:     'words',   // 'words' | 'sentences'
  poolSize: 500,
  direction:'en-fr',
  round:    1,
  score:    0,
  streak:   0,
  correctMatches: 0,
  wrongMatches:   0,
  // shared matching state
  selected:    null,
  matchedIds:  new Set(),
  wrongIds:    new Set(),
  locked:      false,
  usedPairIds: new Set(),
  roundPairs:  [],
  leftTiles:   [],
  rightTiles:  [],
  tileMap:     new Map(),
  // words-only timer
  timeLeft:      GAME_DURATION_S,
  timerInterval: null,
  isNewBest:     false,
};

const app = document.getElementById('app');

/* ─── utils ─── */
function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
function pickRandom(arr, n) { return shuffle(arr).slice(0, n); }
function formatTime(s) { return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; }

/* ─── storage ─── */
function loadBestScore(key) {
  try { return JSON.parse(localStorage.getItem(BEST_KEY) || '{}')[key] ?? 0; }
  catch { return 0; }
}
function saveBestScore(key, score) {
  try {
    const map = JSON.parse(localStorage.getItem(BEST_KEY) || '{}');
    if (score > (map[key] ?? 0)) { map[key] = score; localStorage.setItem(BEST_KEY, JSON.stringify(map)); return true; }
    return false;
  } catch { return false; }
}
function accuracy(c, w) { return (c + w) === 0 ? 100 : Math.round((c / (c + w)) * 100); }
function calcMatchScore(streak) { return 10 + Math.min(streak, 10) * 2; }

/* ─── timer (words only) ─── */
function startTimer() {
  clearInterval(state.timerInterval);
  state.timerInterval = setInterval(() => {
    state.timeLeft -= 1;
    const el = document.getElementById('timer');
    if (el) { el.textContent = formatTime(state.timeLeft); if (state.timeLeft <= 10) el.classList.add('timer-urgent'); }
    if (state.timeLeft <= 0) { clearInterval(state.timerInterval); finishGame(); }
  }, 1000);
}
function stopTimer() { clearInterval(state.timerInterval); state.timerInterval = null; }

/* ─── round setup ─── */
function resetRoundState() {
  state.matchedIds = new Set();
  state.wrongIds   = new Set();
  state.selected   = null;
  state.locked     = false;
}

function layoutColumns() {
  const isSentence = state.mode === 'sentences';
  const tiles = state.roundPairs.flatMap((p) => {
    const frTile = {
      id: `${p.id}-fr`, pairId: p.id, text: p.french, language: 'french', isSentence,
      article: isSentence ? undefined : p.article,
      context: isSentence ? undefined : p.context,
    };
    const enTile = {
      id: `${p.id}-en`, pairId: p.id, text: p.english, language: 'english', isSentence,
      context: isSentence ? undefined : p.context,
    };
    return [frTile, enTile];
  });
  const french  = shuffle(tiles.filter((t) => t.language === 'french'));
  const english = shuffle(tiles.filter((t) => t.language === 'english'));
  const left  = state.direction === 'en-fr' ? english : french;
  const right = state.direction === 'en-fr' ? french  : english;
  left.forEach((t)  => (t.side = 'left'));
  right.forEach((t) => (t.side = 'right'));
  state.leftTiles  = left;
  state.rightTiles = right;
  state.tileMap    = new Map([...left, ...right].map((t) => [t.id, t]));
}

function setupRound() {
  const words     = WORD_POOLS[state.poolSize];
  const available = words.filter((w) => !state.usedPairIds.has(w.id));
  const source    = available.length >= PAIRS_PER_ROUND ? available : words;
  state.roundPairs = pickRandom(source, PAIRS_PER_ROUND);
  resetRoundState();
  layoutColumns();
}

function setupSentenceRound() {
  const available = SENTENCES.filter((s) => !state.usedPairIds.has(s.id));
  const source    = available.length >= PAIRS_PER_ROUND ? available : SENTENCES;
  state.roundPairs = pickRandom(source, PAIRS_PER_ROUND);
  resetRoundState();
  layoutColumns();
}

/* ─── game flow ─── */
function startGame() {
  stopTimer();
  state.screen         = 'game';
  state.round          = 1;
  state.score          = 0;
  state.streak         = 0;
  state.correctMatches = 0;
  state.wrongMatches   = 0;
  state.usedPairIds    = new Set();

  if (state.mode === 'words') {
    state.timeLeft = GAME_DURATION_S;
    setupRound();
    render();
    startTimer();
  } else {
    setupSentenceRound();
    render();
  }
}

function finishGame() {
  stopTimer();
  const key   = state.mode === 'sentences' ? `sent-${state.direction}` : `${state.poolSize}`;
  state.isNewBest = saveBestScore(key, state.score);
  state.screen = 'results';
  render();
}

function nextRound() {
  if (state.round >= TOTAL_ROUNDS) { finishGame(); return; }
  state.roundPairs.forEach((p) => state.usedPairIds.add(p.id));
  state.round += 1;
  if (state.mode === 'words') setupRound();
  else setupSentenceRound();
  render();
}

/* ─── tile selection (unified for both modes) ─── */
function handleSelect(tileId) {
  const tile = state.tileMap.get(tileId);
  if (!tile || state.locked || state.matchedIds.has(tile.id)) return;

  if (!state.selected)               { state.selected = tile; render(); return; }
  if (state.selected.id === tile.id) { state.selected = null; render(); return; }
  if (state.selected.side === tile.side) { state.selected = tile; render(); return; }

  state.locked = true;
  const a = state.selected, b = tile;

  if (a.pairId === b.pairId) {
    const pts = calcMatchScore(state.streak);
    state.score += pts; state.streak += 1; state.correctMatches += 1;
    state.matchedIds.add(a.id); state.matchedIds.add(b.id);
    render();
    setTimeout(() => {
      state.selected = null; state.locked = false;
      if (state.matchedIds.size >= state.roundPairs.length * 2) setTimeout(nextRound, 400);
      render();
    }, 450);
    return;
  }
  state.streak = 0; state.wrongMatches += 1;
  state.wrongIds = new Set([a.id, b.id]);
  render();
  setTimeout(() => { state.selected = null; state.wrongIds = new Set(); state.locked = false; render(); }, 600);
}

/* ─── tile rendering ─── */
function renderTile(tile) {
  const selected = state.selected?.id === tile.id;
  const matched  = state.matchedIds.has(tile.id);
  const wrong    = state.wrongIds.has(tile.id);
  const cls = [
    'tile',
    tile.language,
    tile.isSentence && 'tile-sentence',
    selected && 'selected',
    matched  && 'matched',
    wrong    && 'wrong',
  ].filter(Boolean).join(' ');

  let innerHtml;
  if (tile.isSentence) {
    innerHtml = `<span class="tile-text">${tile.text}</span>`;
  } else {
    const articleHtml = (tile.language === 'french' && tile.article)
      ? `<span class="tile-article">${tile.article}</span> ` : '';
    const contextHtml = tile.context
      ? `<span class="tile-context">${tile.context}</span>` : '';
    innerHtml = `<span class="tile-main">${articleHtml}<span class="tile-text">${tile.text}</span></span>${contextHtml}`;
  }

  return `<button type="button" class="${cls}" data-tile-id="${tile.id}" ${state.locked || matched ? 'disabled' : ''}>
    ${innerHtml}
  </button>`;
}

/* ─── render home ─── */
function renderHome() {
  const bestKey = state.mode === 'sentences' ? `sent-${state.direction}` : `${state.poolSize}`;
  const best    = loadBestScore(bestKey);

  const poolSection = state.mode === 'words'
    ? `<section class="card">
        <h2>Word pool</h2>
        <div class="option-grid">
          ${POOL_SIZES.map((size) => `
            <button type="button" class="option-btn ${state.poolSize === size ? 'active' : ''}" data-pool="${size}">
              <strong>${size.toLocaleString()} words</strong>
              <span>${size===500?'Core essentials':size===1000?'Everyday vocabulary':size===1500?'Strong foundation':'Advanced pool'}</span>
            </button>`).join('')}
        </div>
      </section>`
    : `<section class="card">
        <h2>Sentence pool</h2>
        <div class="sentence-pool-info">200 common phrases — beginner to intermediate</div>
      </section>`;

  const timerStat = state.mode === 'words'
    ? `<div class="stat-pill"><span class="stat-label">Time</span><span class="stat-value">2:00</span></div>`
    : `<div class="stat-pill"><span class="stat-label">Timer</span><span class="stat-value">None</span></div>`;

  app.innerHTML = `
    <div class="screen home-screen">
      <header class="hero">
        <div class="logo-badge">MM</div>
        <h1>Match Madness</h1>
        <p class="subtitle">English ↔ French</p>
      </header>

      <section class="card">
        <h2>Game mode</h2>
        <div class="toggle-row">
          <button type="button" class="toggle-btn ${state.mode==='words'?'active':''}" data-mode="words">Words</button>
          <button type="button" class="toggle-btn ${state.mode==='sentences'?'active':''}" data-mode="sentences">Sentences</button>
        </div>
      </section>

      ${poolSection}

      <section class="card">
        <h2>Direction</h2>
        <div class="toggle-row">
          <button type="button" class="toggle-btn ${state.direction==='en-fr'?'active':''}" data-dir="en-fr">English → French</button>
          <button type="button" class="toggle-btn ${state.direction==='fr-en'?'active':''}" data-dir="fr-en">French → English</button>
        </div>
        <p class="hint">${state.direction==='en-fr' ? 'Left column: English — Right column: French.' : 'Left column: French — Right column: English.'}</p>
      </section>

      <section class="stats-row">
        <div class="stat-pill"><span class="stat-label">Best score</span><span class="stat-value">${best}</span></div>
        ${timerStat}
        <div class="stat-pill"><span class="stat-label">Pairs / round</span><span class="stat-value">${PAIRS_PER_ROUND}</span></div>
      </section>

      <button type="button" class="primary-btn start-btn" id="start-btn">Start matching</button>

      <section class="guide-cards">
        <h2 class="guide-cards-label">French Language Resources</h2>
        <div class="guide-cards-row">
          <a href="pronunciation.html" class="guide-card guide-card--pronunciation">
            <span class="guide-card-icon">🔊</span>
            <span class="guide-card-text">
              <strong>Pronunciation</strong>
              <span>Sounds · Liaison · Accents</span>
            </span>
            <span class="guide-card-arrow">→</span>
          </a>
          <a href="grammar.html" class="guide-card guide-card--grammar">
            <span class="guide-card-icon">📚</span>
            <span class="guide-card-text">
              <strong>Grammar</strong>
              <span>Verbs · Tenses · Pronouns</span>
            </span>
            <span class="guide-card-arrow">→</span>
          </a>
          <a href="reading.html" class="guide-card guide-card--reading">
            <span class="guide-card-icon">📖</span>
            <span class="guide-card-text">
              <strong>Reading</strong>
              <span>Articles · Vocabulary</span>
            </span>
            <span class="guide-card-arrow">→</span>
          </a>
        </div>
      </section>
    </div>`;

  app.querySelectorAll('[data-mode]').forEach((btn) =>
    btn.addEventListener('click', () => { state.mode = btn.dataset.mode; render(); }));
  app.querySelectorAll('[data-pool]').forEach((btn) =>
    btn.addEventListener('click', () => { state.poolSize = Number(btn.dataset.pool); render(); }));
  app.querySelectorAll('[data-dir]').forEach((btn) =>
    btn.addEventListener('click', () => { state.direction = btn.dataset.dir; render(); }));
  document.getElementById('start-btn').addEventListener('click', startGame);
}

/* ─── render word game (with timer) ─── */
function renderWordGame() {
  const { leftTiles, rightTiles } = state;
  const totalTiles = state.roundPairs.length * 2;
  const leftLabel  = state.direction === 'en-fr' ? 'English' : 'French';
  const rightLabel = state.direction === 'en-fr' ? 'French'  : 'English';
  const pct   = Math.min(100, ((state.round - 1 + state.matchedIds.size / Math.max(totalTiles, 1)) / TOTAL_ROUNDS) * 100);
  const urgent = state.timeLeft <= 10;

  app.innerHTML = `
    <div class="screen game-screen">
      <header class="game-header">
        <button type="button" class="ghost-btn" id="quit-btn">✕</button>
        <div class="game-meta">
          <span class="round-tag">Round ${state.round}/${TOTAL_ROUNDS}</span>
          <span class="direction-tag">${state.direction==='en-fr'?'EN → FR':'FR → EN'}</span>
        </div>
        <div id="timer" class="timer${urgent?' timer-urgent':''}">${formatTime(state.timeLeft)}</div>
      </header>
      <div class="progress-wrap">
        <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
      </div>
      <div class="game-status">
        <div class="score-display">${state.score} pts</div>
        ${state.streak >= 2 ? `<span class="streak-badge">🔥 ${state.streak} streak</span>` : '<span></span>'}
      </div>
      <div class="match-board">
        <div class="match-column">
          <h3 class="column-label">${leftLabel}</h3>
          <div class="tile-column">${leftTiles.map(renderTile).join('')}</div>
        </div>
        <div class="match-column">
          <h3 class="column-label">${rightLabel}</h3>
          <div class="tile-column">${rightTiles.map(renderTile).join('')}</div>
        </div>
      </div>
    </div>`;

  document.getElementById('quit-btn').addEventListener('click', () => { stopTimer(); state.screen = 'home'; render(); });
  app.querySelectorAll('[data-tile-id]').forEach((btn) =>
    btn.addEventListener('click', () => handleSelect(btn.dataset.tileId)));
}

/* ─── render sentence game (no timer) ─── */
function renderSentenceGame() {
  const { leftTiles, rightTiles } = state;
  const totalTiles = state.roundPairs.length * 2;
  const leftLabel  = state.direction === 'en-fr' ? 'English' : 'French';
  const rightLabel = state.direction === 'en-fr' ? 'French'  : 'English';
  const pct = Math.min(100, ((state.round - 1 + state.matchedIds.size / Math.max(totalTiles, 1)) / TOTAL_ROUNDS) * 100);

  app.innerHTML = `
    <div class="screen game-screen">
      <header class="game-header">
        <button type="button" class="ghost-btn" id="quit-btn">✕</button>
        <div class="game-meta">
          <span class="round-tag">Round ${state.round}/${TOTAL_ROUNDS}</span>
          <span class="direction-tag">${state.direction==='en-fr'?'EN → FR':'FR → EN'}</span>
        </div>
        <div class="score-display">${state.score} pts</div>
      </header>
      <div class="progress-wrap">
        <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
      </div>
      <div class="game-status">
        <span class="mode-badge">Sentences</span>
        ${state.streak >= 2 ? `<span class="streak-badge">🔥 ${state.streak} streak</span>` : '<span></span>'}
      </div>
      <div class="match-board sentence-board">
        <div class="match-column">
          <h3 class="column-label">${leftLabel}</h3>
          <div class="tile-column">${leftTiles.map(renderTile).join('')}</div>
        </div>
        <div class="match-column">
          <h3 class="column-label">${rightLabel}</h3>
          <div class="tile-column">${rightTiles.map(renderTile).join('')}</div>
        </div>
      </div>
    </div>`;

  document.getElementById('quit-btn').addEventListener('click', () => { state.screen = 'home'; render(); });
  app.querySelectorAll('[data-tile-id]').forEach((btn) =>
    btn.addEventListener('click', () => handleSelect(btn.dataset.tileId)));
}

/* ─── render results ─── */
function renderResults() {
  const acc = accuracy(state.correctMatches, state.wrongMatches);
  const timedOut = state.mode === 'words' && state.timeLeft <= 0;
  app.innerHTML = `
    <div class="screen results-screen">
      <div class="results-card win">
        <div class="results-icon">${timedOut ? '⏱️' : '🎉'}</div>
        <h1>${timedOut ? "Time's up!" : 'Nice work!'}</h1>
        ${state.isNewBest ? '<p class="new-best">New best score!</p>' : ''}
        <div class="results-score">${state.score}</div>
        <p class="results-sub">points</p>
        <div class="results-grid">
          <div class="result-stat"><span>Accuracy</span><strong>${acc}%</strong></div>
          <div class="result-stat"><span>Correct</span><strong>${state.correctMatches}</strong></div>
          <div class="result-stat"><span>Misses</span><strong>${state.wrongMatches}</strong></div>
          <div class="result-stat"><span>Mode</span><strong>${state.mode==='sentences'?'Sentences':'Words'}</strong></div>
        </div>
        <div class="results-actions">
          <button type="button" class="primary-btn" id="again-btn">Play again</button>
          <button type="button" class="secondary-btn" id="home-btn">Change settings</button>
        </div>
      </div>
    </div>`;
  document.getElementById('again-btn').addEventListener('click', startGame);
  document.getElementById('home-btn').addEventListener('click', () => { state.screen = 'home'; render(); });
}

/* ─── top-level router ─── */
function render() {
  if (state.screen === 'home')         renderHome();
  else if (state.screen === 'results') renderResults();
  else if (state.mode === 'sentences') renderSentenceGame();
  else                                 renderWordGame();
}

render();
