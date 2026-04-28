import type { Area } from "../types";

const OPTIONS: { value: Area; label: string }[] = [
  { value: "worldwide", label: "🌍 worldwide" },
  { value: "america",   label: "🌎 americas"  },
  { value: "europe",    label: "🌍 europe"    },
  { value: "asia",      label: "🌏 asia"      },
  { value: "africa",    label: "🌍 africa"    },
];

interface Props {
  value: Area;
  onChange: (a: Area) => void;
  disabled?: boolean;
}

export function RegionPicker({ value, onChange, disabled }: Props) {
  return (
    <div className="hud-chip region-chip">
      <select
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value as Area)}
        aria-label="Region"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
