// Pixel-art forest frame strips — clouds/canopy top, grass/soil bottom.

const BUMP_HEIGHTS = [4, 6, 3, 7, 5, 4, 8, 5, 3, 6];

export function CanopyStrip({ height = 84 }: { height?: number }) {
  return (
    <svg
      width="100%"
      height={height}
      viewBox="0 0 320 42"
      preserveAspectRatio="none"
      style={{ display: "block", imageRendering: "pixelated" }}
    >
      {/* sky band */}
      <rect x="0" y="0" width="320" height="42" fill="var(--sky)" />
      {/* pixel clouds */}
      <g fill="#fff">
        <rect x="20" y="6" width="14" height="3" />
        <rect x="22" y="4" width="10" height="2" />
        <rect x="18" y="9" width="18" height="2" />
        <rect x="120" y="4" width="20" height="3" />
        <rect x="124" y="2" width="12" height="2" />
        <rect x="118" y="7" width="24" height="2" />
        <rect x="240" y="8" width="16" height="3" />
        <rect x="244" y="6" width="10" height="2" />
        <rect x="238" y="11" width="20" height="2" />
      </g>
      {/* dark canopy silhouette */}
      <g fill="var(--leaf-dark)">
        <rect x="0" y="26" width="320" height="16" />
        {Array.from({ length: 40 }).map((_, i) => {
          const h = BUMP_HEIGHTS[i % BUMP_HEIGHTS.length];
          return <rect key={i} x={i * 8} y={26 - h} width="8" height={h} />;
        })}
      </g>
      {/* mid-tone leaf highlights */}
      <g fill="var(--leaf-mid)">
        {Array.from({ length: 20 }).map((_, i) => (
          <rect key={i} x={i * 16 + 2} y="28" width="6" height="2" />
        ))}
        {Array.from({ length: 18 }).map((_, i) => (
          <rect key={i} x={i * 18 + 8} y="32" width="4" height="2" />
        ))}
      </g>
      {/* light leaf speckles */}
      <g fill="var(--leaf-light)">
        {Array.from({ length: 14 }).map((_, i) => (
          <rect key={i} x={i * 22 + 4} y="30" width="2" height="2" />
        ))}
      </g>
    </svg>
  );
}

const BLADE_HEIGHTS = [3, 5, 2, 4, 6, 3, 5];

export function GroundStrip({ height = 32 }: { height?: number }) {
  return (
    <svg
      width="100%"
      height={height}
      viewBox="0 0 320 28"
      preserveAspectRatio="none"
      style={{ display: "block", imageRendering: "pixelated" }}
    >
      {/* dirt base */}
      <rect x="0" y="14" width="320" height="14" fill="var(--soil)" />
      {/* grass band */}
      <rect x="0" y="6" width="320" height="10" fill="var(--leaf-mid)" />
      {/* grass blades */}
      <g fill="var(--leaf-mid)">
        {Array.from({ length: 80 }).map((_, i) => {
          const h = BLADE_HEIGHTS[i % BLADE_HEIGHTS.length];
          return <rect key={i} x={i * 4} y={6 - h} width="2" height={h} />;
        })}
      </g>
      <g fill="var(--leaf-light)">
        {Array.from({ length: 26 }).map((_, i) => (
          <rect key={i} x={i * 12 + 2} y={3} width="1" height="3" />
        ))}
      </g>
      {/* pebbles */}
      <g fill="var(--soil-light)">
        {[14, 60, 110, 168, 220, 268].map((x, i) => (
          <g key={i}>
            <rect x={x} y="20" width="6" height="3" />
            <rect x={x + 1} y="19" width="4" height="1" />
          </g>
        ))}
      </g>
      {/* tiny flowers */}
      {[40, 96, 156, 208, 280].map((x, i) => {
        const colors = ["var(--bloom-pink)", "var(--bloom-yellow)", "var(--bloom-coral)"];
        const c = colors[i % colors.length];
        return (
          <g key={i}>
            <rect x={x} y="3" width="3" height="3" fill={c} />
            <rect x={x + 1} y="2" width="1" height="1" fill={c} />
            <rect x={x - 1} y="4" width="1" height="1" fill={c} />
            <rect x={x + 3} y="4" width="1" height="1" fill={c} />
          </g>
        );
      })}
    </svg>
  );
}
