import { describe, expect, it } from 'vitest';
import { props } from './props';
import { resolveValues, normalizeColor } from './resolve';
import { describe as describeComponent } from './describe';

const config = {
  label: props.Text({ name: 'Label', defaultValue: 'Hello' }),
  count: props.Number({ name: 'Count', defaultValue: 3, min: 0, max: 99, decimals: 0 }),
  size: props.Variant({ name: 'Size', options: ['S', 'M', 'L'], defaultValue: 'M' }),
  bold: props.Boolean({ name: 'Bold' }),
  color: props.Color({ name: 'Color', defaultValue: '#E4572E' }),
};

describe('resolveValues', () => {
  it('fills in defaults when nothing is given', () => {
    expect(resolveValues(config)).toEqual({ label: 'Hello', count: 3, size: 'M', bold: false, color: '#e4572e' });
  });

  it('accepts valid values', () => {
    const out = resolveValues(config, { label: 'Hi', count: 7, size: 'L', bold: true, color: '#00ff00' });
    expect(out).toEqual({ label: 'Hi', count: 7, size: 'L', bold: true, color: '#00ff00' });
  });

  it('drops anything that is not exposed', () => {
    const out = resolveValues(config, { label: 'Hi', onClick: 'alert(1)', __proto__: { polluted: true }, constructor: 'x' });
    expect(Object.keys(out).sort()).toEqual(['bold', 'color', 'count', 'label', 'size']);
  });

  it('clamps and rounds numbers', () => {
    expect(resolveValues(config, { count: 99999 }).count).toBe(99);
    expect(resolveValues(config, { count: -5 }).count).toBe(0);
    expect(resolveValues(config, { count: 4.6 }).count).toBe(5);
    expect(resolveValues(config, { count: '12' }).count).toBe(12);
  });

  it('falls back to the default for values of the wrong type', () => {
    const out = resolveValues(config, { label: 42, count: 'abc', size: 'XL', bold: 'yes', color: 'red' });
    expect(out).toEqual({ label: 'Hello', count: 3, size: 'M', bold: false, color: '#e4572e' });
  });

  it('rejects NaN and Infinity', () => {
    expect(resolveValues(config, { count: NaN }).count).toBe(3);
    expect(resolveValues(config, { count: Infinity }).count).toBe(3);
  });

  it('uses sensible fallbacks when there is no default', () => {
    const out = resolveValues({
      t: props.Text({ name: 'T' }),
      n: props.Number({ name: 'N', min: 5 }),
      v: props.Variant({ name: 'V', options: ['a', 'b'] }),
      c: props.Color({ name: 'C' }),
    });
    expect(out).toEqual({ t: '', n: 5, v: 'a', c: '#000000' });
  });

  it('does not read inherited keys from the input', () => {
    const input = Object.create({ label: 'inherited' });
    expect(resolveValues(config, input).label).toBe('Hello');
  });

  it('works from a stored manifest, with no framework code', () => {
    const manifest = describeComponent({ name: 'X', props: config }, 'react');
    const fromManifest = resolveValues(manifest.props, { count: 500, evil: 1 });
    expect(fromManifest).toEqual({ label: 'Hello', count: 99, size: 'M', bold: false, color: '#e4572e' });
  });
});

describe('normalizeColor', () => {
  it('expands short hex and lowercases', () => {
    expect(normalizeColor('#ABC')).toBe('#aabbcc');
    expect(normalizeColor('#AABBCC')).toBe('#aabbcc');
  });
  it('rejects anything else', () => {
    for (const bad of ['red', 'rgb(0,0,0)', '#12', '#12345', 'url(x)', '', 5, null]) expect(normalizeColor(bad)).toBeUndefined();
  });
});

describe('describe', () => {
  const manifest = describeComponent({ name: 'Chip', group: 'Display', props: config }, 'react');

  it('is plain JSON', () => {
    expect(JSON.parse(JSON.stringify(manifest))).toEqual(JSON.parse(JSON.stringify(manifest)));
    expect(manifest.framework).toBe('react');
  });

  it('lists the exposed props with validated defaults', () => {
    expect(manifest.props.map((p) => p.key)).toEqual(['label', 'count', 'size', 'bold', 'color']);
    expect(manifest.props.find((p) => p.key === 'color')?.defaultValue).toBe('#e4572e');
    expect(manifest.props.find((p) => p.key === 'bold')?.defaultValue).toBe(false);
    expect(manifest.props.find((p) => p.key === 'count')?.settings).toEqual({ min: 0, max: 99, decimals: 0 });
  });
});
