// All 28 tiles in a double-6 domino set
export function createFullSet() {
  const tiles = [];
  let id = 0;
  for (let a = 0; a <= 6; a++) {
    for (let b = a; b <= 6; b++) {
      tiles.push({ id: id++, left: a, right: b });
    }
  }
  return tiles;
}

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Returns { playerHand, aiHand, boneyard }
export function dealHands(tiles) {
  const deck = shuffle(tiles);
  return {
    playerHand: deck.slice(0, 7),
    aiHand: deck.slice(7, 14),
    boneyard: deck.slice(14),
  };
}

// Board is an ordered array of placed tiles: { id, left, right, flipped }
// leftEnd and rightEnd are the open pip values at each end
export function getBoardEnds(board) {
  if (board.length === 0) return { leftEnd: null, rightEnd: null };
  const first = board[0];
  const last = board[board.length - 1];
  return {
    leftEnd: first.flipped ? first.right : first.left,
    rightEnd: last.flipped ? last.left : last.right,
  };
}

// Returns 'left', 'right', or null if tile can't be played
export function canPlay(tile, board) {
  if (board.length === 0) return 'right'; // first tile goes anywhere
  const { leftEnd, rightEnd } = getBoardEnds(board);
  if (tile.left === leftEnd || tile.right === leftEnd) return 'left';
  if (tile.left === rightEnd || tile.right === rightEnd) return 'right';
  return null;
}

// Place a tile on the board at the given end.
// Returns new board array.
export function placeTile(tile, board, end) {
  if (board.length === 0) {
    return [{ ...tile, flipped: false }];
  }

  const { leftEnd, rightEnd } = getBoardEnds(board);

  if (end === 'left') {
    // New tile is prepended. Its RIGHT half (b) must match leftEnd.
    // b = tile.right when not flipped, b = tile.left when flipped.
    const flipped = tile.left === leftEnd; // flip so that b = tile.left = leftEnd
    return [{ ...tile, flipped }, ...board];
  } else {
    // New tile is appended. Its LEFT half (a) must match rightEnd.
    // a = tile.left when not flipped, a = tile.right when flipped.
    const flipped = tile.right === rightEnd; // flip so that a = tile.right = rightEnd
    return [...board, { ...tile, flipped }];
  }
}

export function getPlayableTiles(hand, board) {
  return hand.filter(t => canPlay(t, board) !== null);
}

export function isBlocked(hand, board) {
  return getPlayableTiles(hand, board).length === 0;
}

export function sumPips(hand) {
  return hand.reduce((s, t) => s + t.left + t.right, 0);
}

// Determine winner: 'player', 'ai', or 'draw'
export function checkWinner(playerHand, aiHand, playerBlocked, aiBlocked, boneyard) {
  if (playerHand.length === 0) return 'player';
  if (aiHand.length === 0) return 'ai';
  if (playerBlocked && aiBlocked && boneyard.length === 0) {
    const ps = sumPips(playerHand);
    const as = sumPips(aiHand);
    if (ps < as) return 'player';
    if (as < ps) return 'ai';
    return 'draw';
  }
  return null;
}
