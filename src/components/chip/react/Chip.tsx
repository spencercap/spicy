import { useState } from 'react';
import '../chip.css';

export interface ChipProps {
  /** Text shown in the chip. */
  label?: string;
  /** Number shown in the badge. */
  count?: number;
  /** Any CSS color: name, hex, rgb(), hsl(). */
  color?: string;
}

export function Chip({ label = 'Chip', count = 0, color = '#e4572e' }: ChipProps) {
  return (
    <span className="chip" style={{ '--chip-color': color } as React.CSSProperties}>
      <span className="label">{label}</span>
      <span className="count">{count}</span>
    </span>
  );
}

/** Chip plus inputs: editing any input re-renders the chip immediately. */
export function ChipEditor(initial: ChipProps) {
  const [label, setLabel] = useState(initial.label ?? 'Chip');
  const [count, setCount] = useState(initial.count ?? 0);
  const [color, setColor] = useState(initial.color ?? '#e4572e');

  return (
    <div className="editor">
      <Chip label={label} count={count} color={color} />
      <div className="controls">
        <label>
          label <input type="text" value={label} onChange={(e) => setLabel(e.target.value)} />
        </label>
        <label>
          count{' '}
          <input
            type="number"
            value={count}
            onChange={(e) => setCount(Number(e.target.value) || 0)}
          />
        </label>
        <label>
          color <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        </label>
      </div>
    </div>
  );
}
