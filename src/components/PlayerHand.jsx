import { useState } from 'react';
import DominoTile from './DominoTile.jsx';
import { canPlay, getBoardEnds } from '../game/dominoes.js';

export default function PlayerHand({ hand, board, onPlay, disabled }) {
  const [selected, setSelected] = useState(null);

  const { leftEnd, rightEnd } = getBoardEnds(board);

  function handleTileClick(tile) {
    if (disabled) return;
    if (!canPlay(tile, board)) return;

    if (selected?.id === tile.id) {
      setSelected(null);
      return;
    }

    // Check which ends this tile can go to
    const fitsLeft = tile.left === leftEnd || tile.right === leftEnd;
    const fitsRight = tile.left === rightEnd || tile.right === rightEnd;

    // If it only fits one end, play there directly — no need to ask
    if (fitsLeft && !fitsRight) { onPlay(tile, 'left'); return; }
    if (fitsRight && !fitsLeft) { onPlay(tile, 'right'); return; }

    // Fits both ends — ask the player
    setSelected(tile);
  }

  function handleEndClick(end) {
    if (!selected) return;
    onPlay(selected, end);
    setSelected(null);
  }

  // Check if selected tile can play on each end
  const selectedCanLeft = selected ? (board.length === 0 || selected.left === leftEnd || selected.right === leftEnd) : false;
  const selectedCanRight = selected ? (board.length === 0 || selected.left === rightEnd || selected.right === rightEnd) : false;

  return (
    <div className="player-hand-area">
      {selected && board.length > 0 && (
        <div className="end-picker">
          <span>¿Dónde jugar?</span>
          <button
            className="end-btn"
            disabled={!selectedCanLeft}
            onClick={() => handleEndClick('left')}
          >
            ← Izquierda ({leftEnd})
          </button>
          <button
            className="end-btn"
            disabled={!selectedCanRight}
            onClick={() => handleEndClick('right')}
          >
            Derecha ({rightEnd}) →
          </button>
          <button className="end-btn cancel-btn" onClick={() => setSelected(null)}>
            Cancelar
          </button>
        </div>
      )}
      <div className="player-hand">
        {hand.map(tile => {
          const playability = canPlay(tile, board);
          const isPlayable = !!playability && !disabled;
          return (
            <DominoTile
              key={tile.id}
              left={tile.left}
              right={tile.right}
              horizontal={false}
              selected={selected?.id === tile.id}
              playable={isPlayable}
              onClick={() => {
                if (!isPlayable) return;
                if (board.length === 0) {
                  // First tile — just play to right
                  onPlay(tile, 'right');
                  return;
                }
                handleTileClick(tile);
              }}
              size={56}
            />
          );
        })}
      </div>
    </div>
  );
}
