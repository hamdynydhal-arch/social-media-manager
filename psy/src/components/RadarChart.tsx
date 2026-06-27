import type { FactorKey } from '../engine/types';

interface RadarChartProps {
  scores: Partial<Record<FactorKey, number>>;
  labels: Partial<Record<FactorKey, string>>;
  colors: Partial<Record<FactorKey, string>>;
}

const FACTOR_ORDER: FactorKey[] = ['O', 'C', 'E', 'A', 'N'];
const SIZE = 260;
const CENTER = SIZE / 2;
const RADIUS = 95;
const LABEL_OFFSET = 24;

function polar(index: number, distance: number, total: number) {
  // Start from top (-π/2) and go clockwise
  const angle = (index * 2 * Math.PI) / total - Math.PI / 2;
  return {
    x: CENTER + distance * Math.cos(angle),
    y: CENTER + distance * Math.sin(angle),
  };
}

function pointsString(pts: { x: number; y: number }[]) {
  return pts.map((p) => `${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ');
}

export default function RadarChart({ scores, labels }: RadarChartProps) {
  const n = FACTOR_ORDER.length;
  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  // Grid polygons
  const gridPolygons = gridLevels.map((level) =>
    pointsString(FACTOR_ORDER.map((_, i) => polar(i, RADIUS * level, n)))
  );

  // Axis lines
  const axes = FACTOR_ORDER.map((_, i) => polar(i, RADIUS, n));

  // Score polygon — map 0-100 to 0-RADIUS
  const scorePoints = pointsString(
    FACTOR_ORDER.map((key, i) => {
      const pct = (scores[key] ?? 50) / 100;
      return polar(i, RADIUS * pct, n);
    })
  );

  // Label positions
  const labelPositions = FACTOR_ORDER.map((key, i) => {
    const pt = polar(i, RADIUS + LABEL_OFFSET, n);
    return { key, ...pt };
  });

  return (
    <div className="flex justify-center">
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="overflow-visible"
        style={{ fontFamily: 'Cairo, sans-serif' }}
      >
        {/* Grid circles */}
        {gridPolygons.map((pts, i) => (
          <polygon
            key={i}
            points={pts}
            fill="none"
            stroke="#e0e7ff"
            strokeWidth="1"
          />
        ))}

        {/* Axis lines */}
        {axes.map((pt, i) => (
          <line
            key={i}
            x1={CENTER}
            y1={CENTER}
            x2={pt.x}
            y2={pt.y}
            stroke="#e0e7ff"
            strokeWidth="1"
          />
        ))}

        {/* Score polygon */}
        <polygon
          points={scorePoints}
          fill="rgba(99,102,241,0.18)"
          stroke="rgb(99,102,241)"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Score dots */}
        {FACTOR_ORDER.map((key, i) => {
          const pct = (scores[key] ?? 50) / 100;
          const pt = polar(i, RADIUS * pct, n);
          return (
            <circle
              key={key}
              cx={pt.x}
              cy={pt.y}
              r="5"
              fill="rgb(99,102,241)"
              stroke="white"
              strokeWidth="2"
            />
          );
        })}

        {/* Labels */}
        {labelPositions.map(({ key, x, y }) => (
          <text
            key={key}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="11"
            fontWeight="600"
            fill="#4b5563"
          >
            {labels[key] ?? key}
          </text>
        ))}
      </svg>
    </div>
  );
}
