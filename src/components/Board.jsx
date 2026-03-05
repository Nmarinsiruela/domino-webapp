import DominoTile from './DominoTile.jsx';

export default function Board({ board }) {
  if (board.length === 0) {
    return (
      <div className="board board-empty">
        <span>Juega la primera ficha para comenzar</span>
      </div>
    );
  }

  return (
    <div className="board">
      <div className="board-chain">
        {board.map((tile) => (
          <DominoTile
            key={tile.id}
            left={tile.left}
            right={tile.right}
            flipped={tile.flipped}
            horizontal={true}
            size={34}
          />
        ))}
      </div>
    </div>
  );
}
