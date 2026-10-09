import { props, type PropsConfig } from '@spicy/tinker';

export interface ChipProps {
  label?: string;
  count?: number;
  color?: string;
}

/**
 * The props of Chip that clients may change, and how. One schema shared by every
 * framework version of the component. Props not listed here stay fixed.
 */
export const chipProps = {
  label: props.Text({ name: 'Label', group: 'Content', defaultValue: 'Chip' }),
  count: props.Number({ name: 'Count', group: 'Content', defaultValue: 0, min: 0, max: 999, decimals: 0 }),
  color: props.Color({ name: 'Color', group: 'Style', defaultValue: '#e4572e', tooltip: 'Border, text and badge color' }),
} satisfies PropsConfig<ChipProps>;

export const chipMeta = {
  name: 'Chip',
  description: 'A small badge with a label and a count.',
  group: 'Display',
  props: chipProps,
};
