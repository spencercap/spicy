/** @jsxImportSource solid-js */
import '../gradient.css';
import { gradientVars, type GradientProps } from '../gradient.props';

export type { GradientProps };

// Props are read through `props.*` (not destructured) so Solid keeps them reactive.
export function Gradient(props: GradientProps) {
  return <div class="gradient" aria-hidden="true" style={gradientVars(props)} />;
}
