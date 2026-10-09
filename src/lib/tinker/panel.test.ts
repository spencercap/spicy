import { afterEach, describe, expect, it, vi } from 'vitest';
import { props } from './props';
import { describe as describeComponent } from './describe';
import { createPanel } from './panel';

const manifest = describeComponent(
  {
    name: 'X',
    props: {
      label: props.Text({ name: 'Label', group: 'Content', defaultValue: 'Hi' }),
      count: props.Number({ name: 'Count', group: 'Content', defaultValue: 1, min: 0, max: 9 }),
      size: props.Variant({ name: 'Size', group: 'Style', options: ['S', 'M'], defaultValue: 'S' }),
      bold: props.Boolean({ name: 'Bold', group: 'Style', trueLabel: 'On', falseLabel: 'Off' }),
      color: props.Color({ name: 'Color', defaultValue: '#e4572e' }),
    },
  },
  'react',
);

let panel: ReturnType<typeof createPanel> | undefined;
afterEach(() => panel?.destroy());

const mount = (values?: Record<string, unknown>) => {
  const onChange = vi.fn();
  panel = createPanel(manifest, { values, onChange });
  document.body.append(panel.element);
  const q = <T extends HTMLElement>(key: string) => panel!.element.querySelector<T>(`[data-prop=${key}]`)!;
  const row = (key: string) => q(key).closest('.tinker-row')!;
  const type = (el: HTMLInputElement | HTMLSelectElement, value: string) => {
    el.value = value;
    el.dispatchEvent(new Event('input', { bubbles: true }));
  };
  return { onChange, q, row, type };
};

describe('createPanel', () => {
  it('groups props into collapsible sections, open by default', () => {
    mount();
    const sections = [...panel!.element.querySelectorAll('details.tinker-section')];
    expect(sections.map((s) => s.querySelector('summary')?.textContent)).toEqual(['Content', 'Style']);
    expect(sections.every((s) => s.hasAttribute('open'))).toBe(true);
    // props without a group are not wrapped in a collapsible section
    expect(panel!.element.querySelectorAll('div.tinker-section')).toHaveLength(1);
  });

  it('shows defaults, or the given values', () => {
    const { q } = mount({ label: 'Yo' });
    expect(q<HTMLInputElement>('label').value).toBe('Yo');
    expect(q<HTMLInputElement>('count').value).toBe('1');
    expect(q<HTMLSelectElement>('size').value).toBe('S');
    expect(q<HTMLInputElement>('color').value).toBe('#e4572e');
    expect(panel!.element.querySelector('.tinker-hex')?.textContent).toBe('#e4572e');
  });

  it('gives number inputs their min, max and step', () => {
    const { q } = mount();
    const count = q<HTMLInputElement>('count');
    expect([count.min, count.max, count.step]).toEqual(['0', '9', '1']);
  });

  it('labels each control', () => {
    const { q } = mount();
    expect(panel!.element.querySelector(`label[for="${q('label').id}"]`)?.textContent).toBe('Label');
  });

  it('calls onChange with the raw value of each control type', () => {
    const { onChange, q, type } = mount();
    type(q<HTMLInputElement>('label'), 'Shipped');
    type(q<HTMLInputElement>('count'), '5');
    type(q<HTMLSelectElement>('size'), 'M');
    type(q<HTMLInputElement>('color'), '#00ff00');
    const bold = q<HTMLInputElement>('bold');
    bold.checked = true;
    bold.dispatchEvent(new Event('input', { bubbles: true }));
    expect(onChange.mock.calls).toEqual([
      ['label', 'Shipped'],
      ['count', 5],
      ['size', 'M'],
      ['color', '#00ff00'],
      ['bold', true],
    ]);
  });

  it('marks props that differ from their default, and clears the mark when they match again', () => {
    const { q, row, type } = mount();
    expect(row('label').hasAttribute('data-modified')).toBe(false);
    type(q<HTMLInputElement>('label'), 'Changed');
    expect(row('label').hasAttribute('data-modified')).toBe(true);
    type(q<HTMLInputElement>('label'), 'Hi');
    expect(row('label').hasAttribute('data-modified')).toBe(false);
  });

  it('starts marked when given a non-default value', () => {
    const { row } = mount({ count: 7 });
    expect(row('count').hasAttribute('data-modified')).toBe(true);
    expect(row('label').hasAttribute('data-modified')).toBe(false);
  });

  it('resets a prop to its default from the dot', () => {
    const { onChange, q, row, type } = mount();
    type(q<HTMLInputElement>('count'), '8');
    onChange.mockClear();
    row('count').querySelector<HTMLButtonElement>('.tinker-reset')!.click();
    expect(q<HTMLInputElement>('count').value).toBe('1');
    expect(row('count').hasAttribute('data-modified')).toBe(false);
    expect(onChange).toHaveBeenCalledWith('count', 1);
  });

  it('setValues updates the controls without calling onChange', () => {
    const { onChange, q, row } = mount();
    panel!.setValues({ label: 'From outside', size: 'M', unknown: 'ignored' });
    expect(q<HTMLInputElement>('label').value).toBe('From outside');
    expect(q<HTMLSelectElement>('size').value).toBe('M');
    expect(row('label').hasAttribute('data-modified')).toBe(true);
    expect(onChange).not.toHaveBeenCalled();
  });

  it('shows the true/false label next to a boolean', () => {
    const { q } = mount();
    const hint = () => q('bold').parentElement!.querySelector('.tinker-hint')!.textContent;
    expect(hint()).toBe('Off');
    const bold = q<HTMLInputElement>('bold');
    bold.checked = true;
    bold.dispatchEvent(new Event('input', { bubbles: true }));
    expect(hint()).toBe('On');
  });

  it('removes itself on destroy', () => {
    mount();
    panel!.destroy();
    expect(document.querySelector('.tinker-panel')).toBeNull();
  });

  it('gives every panel unique control ids', () => {
    const a = createPanel(manifest, { onChange() {} });
    const b = createPanel(manifest, { onChange() {} });
    const ids = [...a.element.querySelectorAll('[id]'), ...b.element.querySelectorAll('[id]')].map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
