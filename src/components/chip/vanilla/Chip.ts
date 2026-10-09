import '../chip.css';
import type { VanillaComponent } from '@spicy/tinker/vanilla';
import type { ChipProps } from '../chip.props';

/** Plain DOM version of Chip: draws once, then updates the same nodes in place. */
export const Chip: VanillaComponent<ChipProps> = (host, initial) => {
  const root = document.createElement('span');
  root.className = 'chip';
  const label = document.createElement('span');
  label.className = 'label';
  const count = document.createElement('span');
  count.className = 'count';
  root.append(label, count);
  host.append(root);

  const render = ({ label: l = 'Chip', count: c = 0, color = '#e4572e' }: ChipProps) => {
    root.style.setProperty('--chip-color', color);
    label.textContent = l;
    count.textContent = String(c);
  };
  render(initial);

  return { update: render, unmount: () => root.remove() };
};
