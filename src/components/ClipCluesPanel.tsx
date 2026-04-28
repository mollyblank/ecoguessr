import type { XCRecording } from "../types";

interface Props {
  rec: XCRecording;
}

export function ClipCluesPanel({ rec }: Props) {
  const also = (rec.also ?? []).filter((s) => s && s.trim().length > 0);

  return (
    <div className="clues-card">
      <div className="clues-card-header">field notes</div>
      <div className="clues-card-body">
        <div>
          <span className="clue-label">recorded</span>
          <span className="clue-value">{rec.date}{rec.time ? ` · ${rec.time}` : ""}</span>
        </div>
        {also.length > 0 && (
          <div>
            <span className="clue-label">also heard</span>
            <span className="clue-value">{also.join(", ")}</span>
          </div>
        )}
      </div>
    </div>
  );
}
