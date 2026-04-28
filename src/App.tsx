import { useState } from "react";
import { RegionPicker } from "./components/RegionPicker";
import { AudioPlayer } from "./components/AudioPlayer";
import { GuessMap } from "./components/GuessMap";
import { ClipCluesPanel } from "./components/ClipCluesPanel";
import { RevealPanel } from "./components/RevealPanel";
import { CanopyStrip, GroundStrip } from "./components/PixelFrame";
import { fetchClip } from "./lib/api";
import { distanceKm } from "./lib/haversine";
import { scoreFromKm } from "./lib/score";
import type { Area, LatLng, Phase, XCRecording } from "./types";

const TOTAL_ROUNDS = 5;
const FRAME_TOP = 84;
const FRAME_BOTTOM = 32;

export function App() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [area, setArea] = useState<Area>("worldwide");
  const [clip, setClip] = useState<XCRecording | null>(null);
  const [guess, setGuess] = useState<LatLng | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [round, setRound] = useState(1);
  const [totalScore, setTotalScore] = useState(0);

  async function loadClip() {
    setPhase("loading");
    setGuess(null);
    setClip(null);
    setError(null);
    try {
      const rec = await fetchClip(area);
      setClip(rec);
      setPhase("guessing");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setPhase("error");
    }
  }

  function submitGuess() {
    if (!guess || !clip) return;
    setPhase("revealed");
  }

  function onNext() {
    const earned = scoreFromKm(dist);
    if (round >= TOTAL_ROUNDS) {
      setRound(1);
      setTotalScore(0);
      setPhase("idle");
      setClip(null);
      setGuess(null);
    } else {
      setTotalScore((s) => s + earned);
      setRound((r) => r + 1);
      loadClip();
    }
  }

  const truth: LatLng | null = clip
    ? { lat: Number(clip.lat), lng: Number(clip.lon) }
    : null;

  const dist = guess && truth ? distanceKm(guess, truth) : 0;
  const score = scoreFromKm(dist);

  const hudTop = FRAME_TOP + 16;

  return (
    <div className="app">
      {/* Always-visible map fills the viewport */}
      <div className="map-wrap">
        <GuessMap
          phase={phase}
          guess={guess}
          truth={phase === "revealed" ? truth : null}
          onPickGuess={setGuess}
        />
      </div>

      {/* Pixel art frame — clouds top, grass bottom */}
      <div className="frame-top" style={{ height: FRAME_TOP }}>
        <CanopyStrip height={FRAME_TOP} />
      </div>
      <div className="frame-bottom" style={{ height: FRAME_BOTTOM }}>
        <GroundStrip height={FRAME_BOTTOM} />
      </div>

      {/* HUD — top bar (always visible) */}
      <div className="hud" style={{ top: hudTop }}>
        <div className="hud-title">ecoGuessr</div>
        <div className="hud-right">
          {phase !== "idle" && (
            <>
              <div className="hud-chip round-chip">
                round {round}<span style={{ opacity: 0.6 }}>/</span>{TOTAL_ROUNDS}
              </div>
              <div className="hud-chip score-chip">
                <span style={{ fontSize: 18 }}>★</span>
                <span style={{ fontVariantNumeric: "tabular-nums" }}>{totalScore.toLocaleString()}</span>
                <span style={{ fontSize: 12, opacity: 0.7, fontWeight: 600 }}>pts</span>
              </div>
            </>
          )}
          <RegionPicker
            value={area}
            onChange={setArea}
            disabled={phase === "loading" || phase === "guessing" || phase === "revealed"}
          />
        </div>
      </div>

      {/* Control deck — guessing phase */}
      {phase === "guessing" && clip && (
        <div className="control-deck">
          <AudioPlayer
            src={clip.file}
            length={clip.length}
            date={clip.date}
            time={clip.time}
          />
          <ClipCluesPanel rec={clip} />
          <button
            className="submit-btn"
            onClick={submitGuess}
            disabled={!guess}
          >
            {guess ? "submit guess →" : "drop a pin first"}
          </button>
        </div>
      )}

      {/* Map crosshair hint */}
      {phase === "guessing" && !guess && (
        <div className="map-hint">tap anywhere to drop your pin</div>
      )}

      {/* Reveal card — revealed phase */}
      {phase === "revealed" && clip && (
        <RevealPanel
          rec={clip}
          distanceKm={dist}
          score={score}
          onNext={onNext}
          isLastRound={round >= TOTAL_ROUNDS}
        />
      )}

      {/* Idle overlay */}
      {phase === "idle" && (
        <div className="idle-overlay">
          <div className="idle-title">guess where<br />the bird sings</div>
          <button className="idle-start-btn" onClick={loadClip}>get a clip →</button>
        </div>
      )}

      {/* Loading overlay */}
      {phase === "loading" && (
        <div className="status-overlay">
          <div className="status-msg">Loading recording…</div>
        </div>
      )}

      {/* Error overlay */}
      {phase === "error" && (
        <div className="status-overlay">
          <div className="status-msg error">{error}</div>
          <button className="idle-start-btn" onClick={loadClip}>retry →</button>
        </div>
      )}
    </div>
  );
}
