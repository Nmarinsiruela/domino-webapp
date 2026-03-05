import { useEffect, useRef } from 'react';
import { useGameState } from './game/useGameState.js';
import Board from './components/Board.jsx';
import PlayerHand from './components/PlayerHand.jsx';
import GameInfo from './components/GameInfo.jsx';
import './App.css';

export default function App() {
  const { state, playTile, drawTile, passTurn, aiMove, restart } = useGameState();
  const aiTimerRef = useRef(null);

  // Trigger AI move after a short delay when it's AI's turn
  useEffect(() => {
    if (state.aiThinking && !state.winner) {
      aiTimerRef.current = setTimeout(() => {
        aiMove();
      }, 1800);
    }
    return () => clearTimeout(aiTimerRef.current);
  }, [state.aiThinking, state.winner, state.aiHand, aiMove]);

  // When AI draws, it needs to try again after a delay
  useEffect(() => {
    if (state.turn === 'ai' && !state.winner && !state.aiThinking) {
      aiTimerRef.current = setTimeout(() => {
        aiMove();
      }, 1200);
    }
    return () => clearTimeout(aiTimerRef.current);
  }, [state.turn, state.aiHand.length, state.winner]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Dominó</h1>
        <button className="btn btn-small" onClick={restart}>Nueva partida</button>
      </header>

      <main className="game-layout">
        <GameInfo
          state={state}
          onDraw={drawTile}
          onPass={passTurn}
          onRestart={restart}
        />

        <Board board={state.board} />

        <section className="player-section">
          <h2 className="section-label">Tu mano</h2>
          <PlayerHand
            hand={state.playerHand}
            board={state.board}
            onPlay={playTile}
            disabled={state.turn !== 'player' || !!state.winner}
          />
        </section>
      </main>

      {state.winner && (
        <div className="winner-overlay">
          <div className="winner-card">
            <div className="winner-emoji">
              {state.winner === 'player' ? '' : state.winner === 'ai' ? '' : ''}
            </div>
            <h2>
              {state.winner === 'player'
                ? '¡Ganaste!'
                : state.winner === 'ai'
                ? '¡Ganó la IA!'
                : '¡Empate!'}
            </h2>
            <p>
              {state.winner === 'player'
                ? '¡Buen juego! Vaciaste tu mano.'
                : state.winner === 'ai'
                ? 'La IA fue demasiado lista esta vez.'
                : 'Nadie pudo jugar — gana quien tenga menos puntos.'}
            </p>
            <button className="btn btn-restart" onClick={restart}>
              Jugar de nuevo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
