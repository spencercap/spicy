import type { JsonValue, PropDefinition, PropManifest, PropsConfig } from './types';

/** A schema in either form: the `props` config from a definition, or `manifest.props`. */
export type Schema = Record<string, PropDefinition | undefined> | readonly PropManifest[];

const HEX_COLOR = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

/** Normalizes `#abc` and `#AABBCC` to `#aabbcc`, or returns undefined if it isn't a hex color. */
export function normalizeColor(value: unknown): string | undefined {
  if (typeof value !== 'string' || !HEX_COLOR.test(value)) return undefined;
  const hex = value.slice(1).toLowerCase();
  return '#' + (hex.length === 3 ? [...hex].map((c) => c + c).join('') : hex);
}

type Entry = {
  key: string;
  type: PropDefinition['type'];
  defaultValue?: unknown;
  settings: Record<string, any>;
};

function entries(schema: Schema): Entry[] {
  if (Array.isArray(schema)) {
    return (schema as readonly PropManifest[]).map((p) => ({ ...p, defaultValue: p.defaultValue }));
  }
  return Object.entries(schema as Record<string, PropDefinition | undefined>).flatMap(([key, def]) =>
    def ? [{ key, type: def.type, defaultValue: def.defaultValue, settings: def.settings as Record<string, any> }] : [],
  );
}

function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/** What a prop falls back to when it has no usable value and no declared default. */
export function fallbackValue(type: Entry['type'], settings: Record<string, any>): JsonValue {
  switch (type) {
    case 'Text':
      return '';
    case 'Number':
      return Math.min(Math.max(0, settings.min ?? -Infinity), settings.max ?? Infinity);
    case 'Boolean':
      return false;
    case 'Variant':
      return settings.options?.[0] ?? '';
    case 'Color':
      return '#000000';
  }
}

/** Returns the valid form of `raw`, or undefined if it can't be used. */
function coerce(entry: Entry, raw: unknown): JsonValue | undefined {
  const { type, settings } = entry;
  switch (type) {
    case 'Text':
      return typeof raw === 'string' ? raw : undefined;
    case 'Number': {
      const n = typeof raw === 'number' ? raw : typeof raw === 'string' && raw.trim() !== '' ? Number(raw) : NaN;
      if (!Number.isFinite(n)) return undefined;
      const clamped = Math.min(Math.max(n, settings.min ?? -Infinity), settings.max ?? Infinity);
      return settings.decimals === undefined ? clamped : round(clamped, settings.decimals);
    }
    case 'Boolean':
      if (typeof raw === 'boolean') return raw;
      return raw === 'true' ? true : raw === 'false' ? false : undefined;
    case 'Variant':
      return typeof raw === 'string' && (settings.options as string[]).includes(raw) ? raw : undefined;
    case 'Color':
      return normalizeColor(raw);
  }
}

/**
 * Turns untrusted input into values that are safe to render.
 *
 * - Only exposed props come out; any other key in `input` is dropped.
 * - Every exposed prop comes out: a missing or invalid value falls back to the default.
 * - Numbers are clamped and rounded, variants must be a listed option, colors must be hex.
 *
 * Takes a definition's `props` config or a stored `manifest.props`, so a server can validate
 * client payloads without loading any framework code.
 */
export function resolveValues<P = Record<string, unknown>>(schema: Schema, input: Record<string, unknown> = {}): Partial<P> {
  const out: Record<string, unknown> = {};
  for (const entry of entries(schema)) {
    const own = Object.prototype.hasOwnProperty.call(input, entry.key);
    const fromInput = own ? coerce(entry, input[entry.key]) : undefined;
    const fromDefault = entry.defaultValue === undefined ? undefined : coerce(entry, entry.defaultValue);
    out[entry.key] = fromInput ?? fromDefault ?? fallbackValue(entry.type, entry.settings);
  }
  return out as Partial<P>;
}

export type { PropsConfig };
