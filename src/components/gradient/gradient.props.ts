import { props, type PropsConfig } from '@spicy/tinker';

export interface GradientProps {
  /** First color stop (`#rrggbb`). */
  start?: string;
  /** Middle color stop (`#rrggbb`). */
  middle?: string;
  /** Last color stop (`#rrggbb`). */
  end?: string;
}

export const gradientDefaults = {
  start: '#3b82f6',
  middle: '#ec4899',
  end: '#f59e0b',
} satisfies Required<GradientProps>;

/** The CSS custom properties `gradient.css` reads. Every framework version sets these. */
export function gradientVars(p: GradientProps) {
  return {
    '--gradient-start': p.start ?? gradientDefaults.start,
    '--gradient-middle': p.middle ?? gradientDefaults.middle,
    '--gradient-end': p.end ?? gradientDefaults.end,
  };
}

/** The same variables as an inline `style` string, for Astro. */
export const gradientStyle = (p: GradientProps) =>
  Object.entries(gradientVars(p))
    .map(([name, value]) => `${name}: ${value}`)
    .join('; ');

/** The props of Gradient that clients may change. Shared by every framework version. */
export const gradientProps = {
  start: props.Color({ name: 'Start', group: 'Colors', defaultValue: gradientDefaults.start }),
  middle: props.Color({ name: 'Middle', group: 'Colors', defaultValue: gradientDefaults.middle }),
  end: props.Color({ name: 'End', group: 'Colors', defaultValue: gradientDefaults.end }),
} satisfies PropsConfig<GradientProps>;

export const gradientMeta = {
  name: 'Gradient',
  description: 'A rounded gradient with three color stops, blended in OKLCH.',
  group: 'Display',
  props: gradientProps,
};
