import type { XCRecording } from "../types";

interface Props {
  rec: XCRecording;
  distanceKm: number;
  score: number;
  onNext: () => void;
  isLastRound: boolean;
}

function formatKm(km: number): string {
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km).toLocaleString()} km`;
}

export function RevealPanel({ rec, distanceKm, score, onNext, isLastRound }: Props) {
  const sciName = `${rec.gen} ${rec.sp}${rec.ssp ? ` ${rec.ssp}` : ""}`;

  return (
    <div className="reveal-card">
      {/* Bird identity */}
      <div className="reveal-identity">
        <div className="reveal-label">it was…</div>
        <div className="reveal-bird-name">{rec.en || sciName}</div>
        <div className="reveal-sci">
          {rec.en ? sciName : null}
          {rec.en ? " · " : null}
          {rec.loc}, {rec.cnt}
        </div>
      </div>

      {/* Metrics */}
      <div className="reveal-metrics">
        <div className="reveal-metric">
          <div className="reveal-metric-label">Distance</div>
          <div className="reveal-metric-value">{formatKm(distanceKm)}</div>
        </div>
        <div className="reveal-metric">
          <div className="reveal-metric-label">Score</div>
          <div className="reveal-metric-value accent">+{score.toLocaleString()}</div>
        </div>
      </div>

      {/* Next / finish */}
      <button className="next-btn" onClick={onNext}>
        {isLastRound ? "play again →" : "next clip →"}
      </button>
    </div>
  );
}
