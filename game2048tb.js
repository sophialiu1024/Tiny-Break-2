const boardEl = document.querySelector('#board');
const scoreEl = document.querySelector('#score');
const bestEl = document.querySelector('#best');
const messageEl = document.querySelector('#message');
const winScreen = document.querySelector('#winScreen');
const gameOverScreen = document.querySelector('#gameOverScreen');

const SIZE = 4;
let tiles = [];
let nextId = 1;
let score = 0;
let best = Number(localStorage.blue2048Best || 0);
let ended = false;
let hasWon = false;

const directions = {
  left:  { dr: 0, dc: -1 }, right: { dr: 0, dc: 1 },
  up:    { dr: -1, dc: 0 }, down:  { dr: 1, dc: 0 }
};

function rewardTile(value) {
  if (value === 512) window.tinyBreak.addPoints(50, '2048');
  else if (value === 1024) window.tinyBreak.addPoints(100, '2048');
  else if (value === 2048) window.tinyBreak.addPoints(200, '2048');
  else if (value >= 4096) window.tinyBreak.addPoints(300, '2048');
}

function key(row, col) { return `${row},${col}`; }

function spawnTile() {
  const occupied = new Set(tiles.map(tile => key(tile.row, tile.col)));
  const empty = [];
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      if (!occupied.has(key(row, col))) empty.push({ row, col });
    }
  }
  if (!empty.length) return null;
  const spot = empty[Math.floor(Math.random() * empty.length)];
  const tile = { id: nextId++, value: Math.random() < 0.9 ? 2 : 4, row: spot.row, col: spot.col, merged: false };
  tiles.push(tile);
  return tile;
}

function newGame() {
  tiles = [];
  nextId = 1;
  score = 0;
  ended = false;
  hasWon = false;
  winScreen.hidden = true;
  gameOverScreen.hidden = true;
  messageEl.textContent = '';
  spawnTile();
  spawnTile();
  render();
}

function lineCoordinates(direction, index) {
  const line = [];
  for (let step = 0; step < SIZE; step++) {
    if (direction === 'left') line.push({ row: index, col: step });
    if (direction === 'right') line.push({ row: index, col: SIZE - 1 - step });
    if (direction === 'up') line.push({ row: step, col: index });
    if (direction === 'down') line.push({ row: SIZE - 1 - step, col: index });
  }
  return line;
}

function move(direction) {
  if (ended || !directions[direction]) return;
  const previous = tiles.map(tile => ({ ...tile }));
  const byPosition = new Map(tiles.map(tile => [key(tile.row, tile.col), tile]));
  let changed = false;

  for (let lineIndex = 0; lineIndex < SIZE; lineIndex++) {
    const line = lineCoordinates(direction, lineIndex);
    const result = [];
    for (const spot of line) {
      const tile = byPosition.get(key(spot.row, spot.col));
      if (!tile) continue;
      const destination = line[result.length];
      if (result.length && result[result.length - 1].value === tile.value && !result[result.length - 1].merged) {
        const survivor = result[result.length - 1];
        survivor.value *= 2;
        survivor.merged = true;
        tile.removed = true;
        score += survivor.value;
        rewardTile(survivor.value);
        const mergeSpot = line[result.length - 1];
        survivor.row = mergeSpot.row;
        survivor.col = mergeSpot.col;
        changed = true;
      } else {
        if (tile.row !== destination.row || tile.col !== destination.col) changed = true;
        tile.row = destination.row;
        tile.col = destination.col;
        result.push(tile);
      }
    }
  }

  if (!changed) return;
  tiles = tiles.filter(tile => !tile.removed);
  const spawned = spawnTile();
  if (score > best) { best = score; localStorage.blue2048Best = best; }
  if (!hasWon && tiles.some(tile => tile.value === 2048)) {
    hasWon = true;
    messageEl.textContent = 'You made 2048 — what a beautiful run! ✦';
    winScreen.hidden = false;
  }
  if (!canMove()) {
    ended = true;
    messageEl.textContent = 'The board is full, and there are no moves left.';
    gameOverScreen.hidden = false;
  }
  render(previous, spawned);
  tiles.forEach(tile => { tile.merged = false; });
}

function canMove() {
  if (tiles.length < SIZE * SIZE) return true;
  const occupied = new Map(tiles.map(tile => [key(tile.row, tile.col), tile.value]));
  for (const tile of tiles) {
    if (occupied.get(key(tile.row, tile.col + 1)) === tile.value || occupied.get(key(tile.row + 1, tile.col)) === tile.value) return true;
  }
  return false;
}

function render(previous = [], spawned = null) {
  const oldById = new Map(previous.map(tile => [tile.id, tile]));
  boardEl.innerHTML = '<div class="board-slots" aria-hidden="true">' + Array(16).fill('<span></span>').join('') + '</div><div class="tile-layer"></div>';
  const layer = boardEl.querySelector('.tile-layer');
  for (const tile of tiles) {
    const old = oldById.get(tile.id);
    const moved = old && (old.row !== tile.row || old.col !== tile.col);
    const element = document.createElement('div');
    element.className = `tile${moved ? ' sliding' : ''}${tile.merged ? ' merged' : ''}`;
    element.dataset.value = tile.value;
    element.textContent = tile.value;
    element.style.gridRow = tile.row + 1;
    element.style.gridColumn = tile.col + 1;
    element.style.setProperty('--start-x', old ? `${(old.col - tile.col) * 100}%` : '0%');
    element.style.setProperty('--start-y', old ? `${(old.row - tile.row) * 100}%` : '0%');
    if (spawned && tile.id === spawned.id) element.classList.add('new-tile');
    layer.append(element);
  }
  scoreEl.textContent = score;
  bestEl.textContent = best;
}

document.addEventListener('keydown', event => {
  const direction = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' }[event.key];
  if (direction) { event.preventDefault(); move(direction); }
});

document.querySelector('#newGame').onclick = newGame;
document.querySelector('#continueGame').onclick = () => { winScreen.hidden = true; };
document.querySelector('#retryGame').onclick = newGame;
newGame();
