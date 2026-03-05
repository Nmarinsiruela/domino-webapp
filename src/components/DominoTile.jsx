// Renders a single domino tile using pip dots
const PIP_POSITIONS = {
  0: [],
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[25, 20], [75, 20], [25, 50], [75, 50], [25, 80], [75, 80]],
};

function Half({ value, size }) {
  const pips = PIP_POSITIONS[value] || [];
  const r = size * 0.08;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      {pips.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r={r * (100 / size)} fill="currentColor" />
      ))}
    </svg>
  );
}

export default function DominoTile({
  left,
  right,
  flipped = false,
  horizontal = false,
  selected = false,
  playable = false,
  faceDown = false,
  onClick,
  size = 48,
}) {
  const a = flipped ? right : left;
  const b = flipped ? left : right;

  const isClickable = !!onClick && playable;

  return (
    <div
      className={[
        'domino-tile',
        horizontal ? 'domino-horizontal' : 'domino-vertical',
        selected ? 'selected' : '',
        playable ? 'playable' : '',
        isClickable ? 'clickable' : '',
        faceDown ? 'face-down' : '',
      ].filter(Boolean).join(' ')}
      onClick={isClickable ? onClick : undefined}
      style={{ '--tile-size': `${size}px` }}
      title={faceDown ? '?' : `[${left}|${right}]`}
    >
      {faceDown ? (
        <div className="domino-face-down" />
      ) : (
        <>
          <div className="domino-half">
            <Half value={a} size={size} />
          </div>
          <div className="domino-divider" />
          <div className="domino-half">
            <Half value={b} size={size} />
          </div>
        </>
      )}
    </div>
  );
}
