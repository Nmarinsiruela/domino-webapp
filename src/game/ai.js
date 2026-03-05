import { canPlay, getBoardEnds, getPlayableTiles } from './dominoes.js';

/**
 * AI strategy: greedy + heuristic
 *
 * Priority:
 * 1. Play doubles first (they're hardest to place later)
 * 2. Play to an end that creates fewer options for the opponent
 *    (prefer ends that are harder to match — lower frequency pips)
 * 3. Among remaining options, play the heaviest tile (reduce pip count)
 * 4. Prefer playing to the end that the opponent has already "passed" on
 *    (tracked via passedEnds)
 */

// Returns frequency of each pip value in a hand (helps predict opponent's holdings)
function pipFrequency(hand) {
  const freq = new Array(7).fill(0);
  for (const tile of hand) {
    freq[tile.left]++;
    freq[tile.right]++;
  }
  return freq;
}

// Score a candidate move. Higher score = better.
function scoreMove(tile, end, board, aiHand, passedEnds) {
  let score = 0;

  // Heavy tiles reduce our pip load more
  score += (tile.left + tile.right) * 2;

  // Doubles are hard to place — play them first
  if (tile.left === tile.right) score += 20;

  const { leftEnd, rightEnd } = getBoardEnds(board);
  const targetEnd = end === 'left' ? leftEnd : rightEnd;

  // Bonus if opponent has "passed" on this end before (they likely can't match it)
  if (passedEnds.has(targetEnd)) score += 30;

  // Calculate what the new open end would be after placing this tile
  let newEnd;
  if (end === 'left') {
    newEnd = tile.left === targetEnd ? tile.right : tile.left;
  } else {
    newEnd = tile.left === targetEnd ? tile.right : tile.left;
  }

  // Prefer to keep ends that are "rare" in the remaining game
  // (harder for opponent to match — lower pip value = less common in full set)
  // Double-6 set: pip 0 appears 7 times, pip 6 appears 7 times (all equal actually)
  // So instead penalise creating an end equal to a pip the AI itself holds many of
  const freq = pipFrequency(aiHand);
  // If AI holds many tiles with this pip, opponent also likely has some — neutral
  // If AI holds few, opponent likely blocked — good
  score -= freq[newEnd] * 3;

  return score;
}

/**
 * Pick the best move for the AI.
 * Returns { tile, end } or null if no playable tile.
 */
export function pickAIMove(aiHand, board, passedEnds) {
  const playable = getPlayableTiles(aiHand, board);
  if (playable.length === 0) return null;

  let bestScore = -Infinity;
  let bestMove = null;

  for (const tile of playable) {
    const ends = [];
    if (canPlay(tile, board) === 'left') ends.push('left');
    if (canPlay(tile, board) === 'right') ends.push('right');
    // A tile might match both ends — try both
    const { leftEnd, rightEnd } = getBoardEnds(board);
    if (board.length > 0) {
      if ((tile.left === leftEnd || tile.right === leftEnd) && !ends.includes('left')) ends.push('left');
      if ((tile.left === rightEnd || tile.right === rightEnd) && !ends.includes('right')) ends.push('right');
    }

    for (const end of [...new Set(ends)]) {
      const s = scoreMove(tile, end, board, aiHand, passedEnds);
      if (s > bestScore) {
        bestScore = s;
        bestMove = { tile, end };
      }
    }
  }

  return bestMove;
}
