import DominoTile from './DominoTile.jsx';
import { getPlayableTiles, isBlocked } from '../game/dominoes.js';

export default function GameInfo({
  state,
  onDraw,
  onPass,
  onRestart,
}) {
  const { playerHand, aiHand, boneyard, board, turn, winner, message } = state;

  const playerPlayable = getPlayableTiles(playerHand, board);
  const playerBlocked = isBlocked(playerHand, board);
  const canDraw = turn === 'player' && boneyard.length > 0;
  const mustPass = turn === 'player' && playerBlocked && boneyard.length === 0;

  return (
    <div className="game-info">
      <div className="scores">
        <div className={`score-card ${turn === 'ai' && !winner ? 'active-turn' : ''}`}>
          <span className="score-label">🤖 AI</span>
          <span className="score-tiles">{aiHand.length} fichas</span>
          <div className="ai-tiles">
            {aiHand.map(t => (
              <DominoTile key={t.id} left={t.left} right={t.right} faceDown size={28} />
            ))}
          </div>
        </div>

        <div className="boneyard-info">
          <span>🃏 Mazo</span>
          <span className="boneyard-count">{boneyard.length}</span>
        </div>

        <div className={`score-card ${turn === 'player' && !winner ? 'active-turn' : ''}`}>
          <span className="score-label">👤 You</span>
          <span className="score-tiles">{playerHand.length} fichas</span>
        </div>
      </div>

      <div className="message-bar">
        <p className="message">{message}</p>
      </div>

      <div className="action-buttons">
        {canDraw && (
          <button className="btn btn-draw" onClick={onDraw}>
            Robar del mazo ({boneyard.length})
          </button>
        )}
        {mustPass && (
          <button className="btn btn-pass" onClick={onPass}>
            Pasar turno
          </button>
        )}
        {winner && (
          <button className="btn btn-restart" onClick={onRestart}>
            Jugar de nuevo
          </button>
        )}
      </div>
    </div>
  );
}
