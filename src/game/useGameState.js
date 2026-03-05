import { useReducer, useCallback } from 'react';
import { createFullSet, dealHands, canPlay, placeTile, isBlocked, checkWinner, getPlayableTiles } from './dominoes.js';
import { pickAIMove } from './ai.js';

function initGame() {
  const tiles = createFullSet();
  const { playerHand, aiHand, boneyard } = dealHands(tiles);
  // Highest double goes first — if player has it they go first, else AI goes first
  const highestDouble = [6, 5, 4, 3, 2, 1, 0];
  let turn = 'player';
  for (const d of highestDouble) {
    const pHas = playerHand.some(t => t.left === d && t.right === d);
    const aHas = aiHand.some(t => t.left === d && t.right === d);
    if (pHas) { turn = 'player'; break; }
    if (aHas) { turn = 'ai'; break; }
  }

  return {
    playerHand,
    aiHand,
    boneyard,
    board: [],
    turn,
    winner: null,
    passedEnds: new Set(), // pip values opponent skipped
    message: turn === 'player' ? '¡Tu turno! Juega una ficha.' : 'La IA sale primero...',
    aiThinking: turn === 'ai',
  };
}

function reducer(state, action) {
  switch (action.type) {
    case 'RESTART':
      return initGame();

    case 'PLAYER_PLAY': {
      const { tile, end } = action;
      if (state.turn !== 'player' || state.winner) return state;
      if (canPlay(tile, state.board) === null) return state;

      const newBoard = placeTile(tile, state.board, end);
      const newHand = state.playerHand.filter(t => t.id !== tile.id);
      const winner = newHand.length === 0 ? 'player' : null;

      return {
        ...state,
        board: newBoard,
        playerHand: newHand,
        winner,
        turn: winner ? null : 'ai',
        message: winner ? '¡Ganaste!' : 'La IA está pensando...',
        aiThinking: !winner,
      };
    }

    case 'PLAYER_DRAW': {
      if (state.turn !== 'player' || state.boneyard.length === 0) return state;
      const [drawn, ...rest] = state.boneyard;
      const newHand = [...state.playerHand, drawn];
      // Check if drawn tile is playable
      const canPlayNow = getPlayableTiles(newHand, state.board).length > 0;
      return {
        ...state,
        playerHand: newHand,
        boneyard: rest,
        message: canPlayNow
          ? `Robaste [${drawn.left}|${drawn.right}]. ¡Ahora juega!`
          : rest.length === 0
            ? 'Pozo vacío. Debes pasar.'
            : `Robaste [${drawn.left}|${drawn.right}]. Roba de nuevo o juega.`,
      };
    }

    case 'PLAYER_PASS': {
      // Only valid when hand is blocked and boneyard is empty
      if (state.turn !== 'player') return state;
      const { leftEnd, rightEnd } = state.board.length > 0
        ? { leftEnd: state.board[0].flipped ? state.board[0].right : state.board[0].left, rightEnd: state.board[state.board.length - 1].flipped ? state.board[state.board.length - 1].left : state.board[state.board.length - 1].right }
        : { leftEnd: null, rightEnd: null };

      const newPassed = new Set(state.passedEnds);
      if (leftEnd !== null) newPassed.add(leftEnd);
      if (rightEnd !== null) newPassed.add(rightEnd);

      const aiB = isBlocked(state.aiHand, state.board);
      const winner = checkWinner(state.playerHand, state.aiHand, true, aiB, state.boneyard);

      return {
        ...state,
        turn: winner ? null : 'ai',
        winner,
        passedEnds: newPassed,
        message: winner
          ? winner === 'player' ? '¡Ganaste!' : winner === 'ai' ? '¡Ganó la IA!' : '¡Empate!'
          : 'Pasaste. La IA está pensando...',
        aiThinking: !winner,
      };
    }

    case 'AI_MOVE': {
      if (state.turn !== 'ai' || state.winner) return state;

      const move = pickAIMove(state.aiHand, state.board, state.passedEnds);

      if (!move) {
        // AI is blocked — check boneyard
        if (state.boneyard.length > 0) {
          const [drawn, ...rest] = state.boneyard;
          return {
            ...state,
            aiHand: [...state.aiHand, drawn],
            boneyard: rest,
            message: 'La IA robó del pozo...',
            // stay on AI turn
          };
        }
        // AI must pass
        const playerB = isBlocked(state.playerHand, state.board);
        const winner = checkWinner(state.playerHand, state.aiHand, playerB, true, state.boneyard);
        return {
          ...state,
          turn: winner ? null : 'player',
          winner,
          message: winner
            ? winner === 'player' ? '¡Ganaste!' : winner === 'ai' ? '¡Ganó la IA!' : '¡Empate!'
            : 'La IA pasó. ¡Tu turno!',
          aiThinking: false,
        };
      }

      const newBoard = placeTile(move.tile, state.board, move.end);
      const newAiHand = state.aiHand.filter(t => t.id !== move.tile.id);
      const winner = newAiHand.length === 0 ? 'ai' : null;

      return {
        ...state,
        board: newBoard,
        aiHand: newAiHand,
        winner,
        turn: winner ? null : 'player',
        message: winner
          ? '🤖 AI wins!'
          : `La IA jugó [${move.tile.left}|${move.tile.right}]. ¡Tu turno!`,
        aiThinking: false,
      };
    }

    default:
      return state;
  }
}

export function useGameState() {
  const [state, dispatch] = useReducer(reducer, null, initGame);

  const playTile = useCallback((tile, end) => {
    dispatch({ type: 'PLAYER_PLAY', tile, end });
  }, []);

  const drawTile = useCallback(() => {
    dispatch({ type: 'PLAYER_DRAW' });
  }, []);

  const passTurn = useCallback(() => {
    dispatch({ type: 'PLAYER_PASS' });
  }, []);

  const aiMove = useCallback(() => {
    dispatch({ type: 'AI_MOVE' });
  }, []);

  const restart = useCallback(() => {
    dispatch({ type: 'RESTART' });
  }, []);

  return { state, playTile, drawTile, passTurn, aiMove, restart };
}
