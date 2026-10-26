// Entry point for the 2048 game application, calls createNewGame() to initialize the game
import { createNewGame, hasWon, isGameOver, isValidBoard, makeMove } from './board.js';

const SAVED_GAME_KEY = '2048-saved-game';
const THEME_KEY = '2048-theme';
const themeSelect = document.querySelector('#theme-select');
const savedTheme = localStorage.getItem(THEME_KEY);
const themes = Array.from(themeSelect.options, option => option.value);
const initialTheme = themes.includes(savedTheme) ? savedTheme : 'classic';

document.documentElement.dataset.theme = initialTheme;
themeSelect.value = initialTheme;
themeSelect.addEventListener('change', () => {
  document.documentElement.dataset.theme = themeSelect.value;
  localStorage.setItem(THEME_KEY, themeSelect.value);
});

function loadSavedGame() {
  try {
    const savedGame = JSON.parse(localStorage.getItem(SAVED_GAME_KEY));

    if (
      savedGame &&
      isValidBoard(savedGame.board) &&
      Number.isInteger(savedGame.score) &&
      savedGame.score >= 0
    ) {
      const undoState = savedGame.undoState;
      return {
        ...savedGame,
        undoState: undoState &&
          isValidBoard(undoState.board) &&
          Number.isInteger(undoState.score) &&
          undoState.score >= 0 &&
          typeof undoState.winAcknowledged === 'boolean'
          ? undoState
          : null
      };
    }
  } catch {
    // A missing or invalid saved game simply starts a new game.
  }

  return null;
}

function saveGame() {
  localStorage.setItem(SAVED_GAME_KEY, JSON.stringify({ board, score, undoState }));
}

const savedGame = loadSavedGame();
let board = savedGame?.board ?? createNewGame();
let score = savedGame?.score ?? 0;
let bestScore = Number(localStorage.getItem('2048-best-score')) || 0;
let winAcknowledged = false;
let undoState = savedGame?.undoState ?? null;

const gameContainer = document.querySelector('#game-container');
const restartButton = document.querySelector('#restart-button');
const undoButton = document.querySelector('#undo-button');
const restartDialog = document.querySelector('#restart-dialog');
const scoreElement = document.querySelector('#score');
const bestScoreElement = document.querySelector('#best-score');
const message = document.querySelector('#message');
const gameOverlay = document.querySelector('#game-overlay');
const overlayMessage = document.querySelector('#overlay-message');
const overlayActionButton = document.querySelector('#overlay-action-button');
const SWIPE_THRESHOLD = 30;
let touchStartX = 0;
let touchStartY = 0;
const MOVE_DURATION = 130;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const tileLayer = document.createElement('div');
tileLayer.className = 'tile-layer';
let tiles = new Map();
let moving = false;
let pendingDirection = null;
let gameVersion = 0;
let activeAnimations = [];

for (let index = 0; index < 16; index++) {
  const cell = document.createElement('div');
  cell.className = 'cell';
  cell.setAttribute('aria-hidden', 'true');
  gameContainer.append(cell);
}
gameContainer.append(tileLayer);

function updateBestScore() {
  if (score > bestScore) {
    bestScore = score;
    localStorage.setItem('2048-best-score', bestScore);
  }

  bestScoreElement.textContent = bestScore;
  bestScoreElement.style.setProperty('--score-digits', String(bestScore).length);
}

function updateMessage() {
  if (isGameOver(board)) {
    message.textContent = 'Game over — press Restart to try again.';
    showOverlay('Game over', 'Try again');
  } else if (hasWon(board)) {
    message.textContent = 'You made 2048!';

    if (!winAcknowledged) {
      showOverlay('You made 2048!', 'Keep playing');
    } else {
      hideOverlay();
    }
  } else {
    message.textContent = '';
    hideOverlay();
  }
}

function showOverlay(text, actionText) {
  overlayMessage.textContent = text;
  overlayActionButton.textContent = actionText;
  gameOverlay.hidden = false;
}

function hideOverlay() {
  gameOverlay.hidden = true;
}

function tileKey({ row, col }) {
  return `${row},${col}`;
}

function tileTransform({ row, col }) {
  return `translate(calc(${col} * (var(--cell-size) + var(--cell-gap))), calc(${row} * (var(--cell-size) + var(--cell-gap))))`;
}

function setTileValue(element, value) {
  const face = element.firstElementChild;
  face.className = `cell tile tile-${value}`;
  face.textContent = value;
  face.classList.toggle('tile-super', value >= 16384);
  face.style.fontSize = value >= 4096
    ? `min(24px, calc(var(--cell-size) * ${1.35 / String(value).length}))`
    : '';
}

function createTile(row, col, value, appear = false) {
  const element = document.createElement('div');
  element.className = 'tile-position';
  element.style.transform = tileTransform({ row, col });
  element.append(document.createElement('div'));
  setTileValue(element, value);
  if (appear) {
    element.firstElementChild.classList.add('tile-new');
  }
  tileLayer.append(element);
  return element;
}

function updateGameState() {
  scoreElement.textContent = score;
  scoreElement.style.setProperty('--score-digits', String(score).length);
  undoButton.disabled = moving || !undoState;
  updateBestScore();
  updateMessage();
  saveGame();
}

function renderBoard() {
  tileLayer.replaceChildren();
  tiles = new Map();
  board.forEach((row, rowIndex) => row.forEach((value, col) => {
    if (value !== 0) {
      tiles.set(tileKey({ row: rowIndex, col }), createTile(rowIndex, col, value));
    }
  }));
  updateGameState();
}

function startNewGame() {
  gameVersion++;
  activeAnimations.forEach(animation => animation.finish());
  activeAnimations = [];
  moving = false;
  pendingDirection = null;
  board = createNewGame();
  score = 0;
  winAcknowledged = false;
  undoState = null;
  renderBoard();
}

function undoMove() {
  if (moving || !undoState) {
    return;
  }

  board = undoState.board;
  score = undoState.score;
  winAcknowledged = undoState.winAcknowledged;
  undoState = null;
  renderBoard();
}

restartButton.addEventListener('click', () => restartDialog.showModal());
undoButton.addEventListener('click', undoMove);

restartDialog.addEventListener('close', () => {
  if (restartDialog.returnValue === 'restart') {
    startNewGame();
  }
});

overlayActionButton.addEventListener('click', () => {
  if (isGameOver(board)) {
    restartDialog.showModal();
  } else {
    winAcknowledged = true;
    updateMessage();
  }
});

async function playMove(direction) {
  if (!gameOverlay.hidden || restartDialog.open) {
    return;
  }
  if (moving) {
    pendingDirection = direction;
    return;
  }
  if (isGameOver(board)) {
    return;
  }

  const result = makeMove(board, direction);
  if (result.board === board) {
    return;
  }

  moving = true;
  undoState = {
    board: board.map(row => [...row]),
    score,
    winAcknowledged
  };
  undoButton.disabled = true;
  const version = gameVersion;
  const nextTiles = new Map();
  const consumedTiles = [];
  const duration = reducedMotion.matches ? 0 : MOVE_DURATION;
  activeAnimations = [];

  for (const movement of result.movements) {
    const element = tiles.get(tileKey(movement.from));
    const from = element.style.transform;
    const to = tileTransform(movement.to);
    element.firstElementChild.classList.remove('tile-new', 'tile-merged');
    element.style.transform = to;

    if (from !== to && duration > 0) {
      activeAnimations.push(element.animate(
        [{ transform: from }, { transform: to }],
        { duration, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
      ));
    }

    const key = tileKey(movement.to);
    if (nextTiles.has(key)) {
      consumedTiles.push(element);
    } else {
      nextTiles.set(key, element);
    }
  }

  // Persist the accepted move immediately, but reveal merges and spawns after sliding.
  board = result.board;
  score += result.scoreGained;
  saveGame();
  await Promise.all(activeAnimations.map(animation => animation.finished));

  if (version !== gameVersion) {
    return;
  }

  consumedTiles.forEach(element => element.remove());
  for (const merge of result.merges) {
    const element = nextTiles.get(tileKey(merge));
    setTileValue(element, merge.value);
    element.firstElementChild.classList.add('tile-merged');
  }
  const { row, col, value } = result.spawnedTile;
  nextTiles.set(tileKey(result.spawnedTile), createTile(row, col, value, true));
  tiles = nextTiles;
  activeAnimations = [];
  moving = false;
  updateGameState();

  const nextDirection = pendingDirection;
  pendingDirection = null;
  if (nextDirection) {
    playMove(nextDirection);
  }
}

document.addEventListener('keydown', event => {
  if (event.target instanceof Element && event.target.closest('select, input, textarea, [contenteditable]')) {
    return;
  }

  const directions = {
    ArrowLeft: 'left',
    ArrowRight: 'right',
    ArrowUp: 'up',
    ArrowDown: 'down'
  };

  const direction = directions[event.key];

  if (!direction) {
    return;
  }

  event.preventDefault();
  playMove(direction);
});

gameContainer.addEventListener('touchstart', event => {
  const touch = event.changedTouches[0];
  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
}, { passive: true });

gameContainer.addEventListener('touchend', event => {
  const touch = event.changedTouches[0];
  const distanceX = touch.clientX - touchStartX;
  const distanceY = touch.clientY - touchStartY;

  if (Math.max(Math.abs(distanceX), Math.abs(distanceY)) < SWIPE_THRESHOLD) {
    return;
  }

  let direction;

  if (Math.abs(distanceX) > Math.abs(distanceY)) {
    direction = distanceX > 0 ? 'right' : 'left';
  } else {
    direction = distanceY > 0 ? 'down' : 'up';
  }

  playMove(direction);
}, { passive: true });

renderBoard();
