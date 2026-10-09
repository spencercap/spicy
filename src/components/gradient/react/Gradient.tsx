import '../gradient.css';
import { gradientVars, type GradientProps } from '../gradient.props';

export type { GradientProps };

export function Gradient(props: GradientProps) {
  return <div className="gradient" aria-hidden="true" style={gradientVars(props) as React.CSSProperties} />;
}
