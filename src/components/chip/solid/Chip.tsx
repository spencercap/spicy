/** @jsxImportSource solid-js */
import { createSignal } from 'solid-js';
import '../chip.css';

export interface ChipProps {
  /** Text shown in the chip. */
  label?: string;
  /** Number shown in the badge. */
  count?: number;
  /** Any CSS color: name, hex, rgb(), hsl(). */
  color?: string;
}

// Props are read through `props.*` (not destructured) so Solid keeps them reactive.
export function Chip(props: ChipProps) {
  return (
    <span class="chip" style={{ '--chip-color': props.color ?? '#e4572e' }}>
      <span class="label">{props.label ?? 'Chip'}</span>
      <span class="count">{props.count ?? 0}</span>
    </span>
  );
}

/** Chip plus inputs: each signal updates just the part of the chip that uses it. */
export function ChipEditor(initial: ChipProps) {
  const [label, setLabel] = createSignal(initial.label ?? 'Chip');
  const [count, setCount] = createSignal(initial.count ?? 0);
  const [color, setColor] = createSignal(initial.color ?? '#e4572e');

  return (
    <div class="editor">
      <Chip label={label()} count={count()} color={color()} />
      <div class="controls">
        <label>
          label <input type="text" value={label()} onInput={(e) => setLabel(e.currentTarget.value)} />
        </label>
        <label>
          count{' '}
          <input
            type="number"
            value={count()}
            onInput={(e) => setCount(Number(e.currentTarget.value) || 0)}
          />
        </label>
        <label>
          color <input type="color" value={color()} onInput={(e) => setColor(e.currentTarget.value)} />
        </label>
      </div>
    </div>
  );
}
