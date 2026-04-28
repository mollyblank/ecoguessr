import { useEffect, useRef, useState } from "react";

interface Props {
  src: string;
  length: string;
  date: string;
  time: string;
}

const WAVE_BARS = [6, 10, 14, 8, 18, 22, 14, 10, 16, 24, 18, 12, 8, 14, 20, 16, 10, 14, 8, 12, 18, 22, 14, 10, 6, 12, 16, 8];

export function AudioPlayer({ src, length, date, time }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = 0;
    setPlaying(false);
  }, [src]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) { a.play(); } else { a.pause(); }
  };

  const replay = () => {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = 0;
    a.play();
  };

  return (
    <div className="audio-module">
      {/* Lantern — the big glowing play button */}
      <div className="lantern">
        <div className={`lantern-glow${playing ? " playing" : ""}`} />
        <button className="lantern-btn" onClick={toggle} aria-label={playing ? "Pause" : "Play"}>
          {playing ? (
            <svg width="42" height="42" viewBox="0 0 24 24" fill="var(--ink)">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg width="46" height="46" viewBox="0 0 24 24" fill="var(--ink)" style={{ marginLeft: 4 }}>
              <polygon points="6,3 21,12 6,21" />
            </svg>
          )}
        </button>
      </div>

      {/* Audio info card */}
      <div className="audio-card">
        <div className="audio-card-meta">now playing · {date} · {time}</div>
        <div className="audio-card-waverow">
          <div className="waveform">
            {WAVE_BARS.map((h, i) => (
              <div
                key={i}
                className={`waveform-bar${playing ? " playing" : ""}`}
                style={{
                  height: h,
                  animationDelay: playing ? `${i * 0.04}s` : "0s",
                }}
              />
            ))}
          </div>
          <span className="audio-length">{length}</span>
        </div>
        <div className="audio-card-actions">
          <button className="small-btn" onClick={replay}>↻ replay</button>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={src}
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />
    </div>
  );
}
