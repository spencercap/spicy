import '../gradient.css';
import type { VanillaComponent } from '@spicy/tinker/vanilla';
import { gradientVars, type GradientProps } from '../gradient.props';

/** Plain DOM version of Gradient: draws once, then updates the same node in place. */
export const Gradient: VanillaComponent<GradientProps> = (host, initial) => {
  const el = document.createElement('div');
  el.className = 'gradient';
  el.setAttribute('aria-hidden', 'true');
  host.append(el);

  const render = (props: GradientProps) => {
    for (const [name, value] of Object.entries(gradientVars(props))) el.style.setProperty(name, value);
  };
  render(initial);

  return { update: render, unmount: () => el.remove() };
};
