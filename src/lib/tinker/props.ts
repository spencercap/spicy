import type { PropDefinition, PropKind, PropSettings, PropValues } from './types';

type BaseOptions = {
  /** Label shown in the panel. */
  name: string;
  /** Panel section this prop is listed under. */
  group?: string;
  tooltip?: string;
};

type Options<K extends PropKind> = BaseOptions & { defaultValue?: PropValues[K] } & PropSettings[K];

function builder<K extends PropKind>(type: K, settingKeys: string[]) {
  return (options: Options<K>): PropDefinition<K> => {
    const { name, group, tooltip, defaultValue, ...rest } = options as Options<K> & Record<string, unknown>;
    const settings = Object.fromEntries(
      settingKeys.filter((key) => rest[key] !== undefined).map((key) => [key, rest[key]]),
    );
    return { type, name, group, tooltip, defaultValue, settings } as PropDefinition<K>;
  };
}

/**
 * Builders for the controls a prop can be exposed as.
 *
 * ```ts
 * props.Text({ name: 'Label', defaultValue: 'Hello' })
 * props.Number({ name: 'Count', min: 0, max: 99, decimals: 0 })
 * props.Variant({ name: 'Size', options: ['S', 'M', 'L'] })
 * ```
 */
export const props = {
  /** Plain text, passed to the component as a `string`. */
  Text: builder('Text', []),
  /** A number, passed as a `number`. Clamped to `min`/`max` and rounded to `decimals`. */
  Number: builder('Number', ['min', 'max', 'decimals']),
  /** On/off, passed as a `boolean`. */
  Boolean: builder('Boolean', ['trueLabel', 'falseLabel']),
  /** One of a fixed list, passed as the chosen `string`. */
  Variant: builder('Variant', ['options']),
  /** A `#rrggbb` color, passed as a `string`. */
  Color: builder('Color', []),
};
