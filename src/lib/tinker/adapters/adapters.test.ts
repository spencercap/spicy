import { afterEach, describe, expect, it } from 'vitest';
import { act, createElement } from 'react';
import { createRenderEffect } from 'solid-js';
import { h, nextTick } from 'vue';
import { props } from '../props';
import type { ComponentData } from '../types';
import { declareComponent as declareReact } from './react';
import { declareComponent as declareSolid } from './solid';
import { declareComponent as declareVue } from './vue';
import { declareComponent as declareVanilla, type VanillaComponent } from './vanilla';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

interface ChipProps {
  label?: string;
  count?: number;
  /** Not exposed below. */
  secret?: string;
}

const data: ComponentData<ChipProps> = {
  name: 'Chip',
  props: {
    label: props.Text({ name: 'Label', defaultValue: 'Hi' }),
    count: props.Number({ name: 'Count', defaultValue: 1, min: 0, max: 9, decimals: 0 }),
  },
};

const text = (p: ChipProps) => `${p.label}:${p.count}:${p.secret ?? '-'}`;

let el: HTMLElement;
afterEach(() => el?.remove());
const fresh = () => {
  el = document.createElement('div');
  document.body.append(el);
  return el;
};

// Each case knows how to await its framework's async rendering.
const cases = [
  {
    framework: 'react',
    define: () => declareReact<ChipProps>((p) => createElement('span', null, text(p)), data),
    flush: () => act(async () => {}),
    wrap: (fn: () => void) => act(async () => fn()),
  },
  {
    framework: 'solid',
    define: () =>
      declareSolid<ChipProps>((p) => {
        const span = document.createElement('span');
        createRenderEffect(() => (span.textContent = text(p)));
        return span;
      }, data),
    flush: async () => {},
    wrap: async (fn: () => void) => fn(),
  },
  {
    framework: 'vue',
    define: () => declareVue<ChipProps>((p: ChipProps) => h('span', text(p)), data),
    flush: () => nextTick(),
    wrap: async (fn: () => void) => {
      fn();
      await nextTick();
    },
  },
  {
    framework: 'vanilla',
    define: () => {
      const component: VanillaComponent<ChipProps> = (host, initial) => {
        const span = document.createElement('span');
        host.append(span);
        span.textContent = text(initial);
        return {
          update: (next) => (span.textContent = text(next)),
          unmount: () => span.remove(),
        };
      };
      return declareVanilla(component, data);
    },
    flush: async () => {},
    wrap: async (fn: () => void) => fn(),
  },
];

describe.each(cases)('$framework adapter', ({ framework, define, wrap }) => {
  it('records its framework and a JSON manifest', () => {
    const def = define();
    expect(def.framework).toBe(framework);
    expect(def.manifest.props.map((p) => p.key)).toEqual(['label', 'count']);
  });

  it('mounts with defaults', async () => {
    const def = define();
    await wrap(() => def.mount(fresh()));
    expect(el.textContent).toBe('Hi:1:-');
  });

  it('mounts with validated values and drops what is not exposed', async () => {
    const def = define();
    await wrap(() => def.mount(fresh(), { label: 'Yo', count: 999, secret: 'leak' }));
    expect(el.textContent).toBe('Yo:9:-');
  });

  it('passes trusted fixed props through', async () => {
    const def = define();
    await wrap(() => def.mount(fresh(), { label: 'A' }, { secret: 'ok' }));
    expect(el.textContent).toBe('A:1:ok');
  });

  it('merges updates into the current values and re-validates', async () => {
    const def = define();
    let mounted!: ReturnType<typeof def.mount>;
    await wrap(() => (mounted = def.mount(fresh(), { label: 'A', count: 2 })));
    await wrap(() => mounted.update({ count: 5 }));
    expect(el.textContent).toBe('A:5:-');
    await wrap(() => mounted.update({ count: -3, label: 'B' }));
    expect(el.textContent).toBe('B:0:-');
  });

  it('unmounts cleanly', async () => {
    const def = define();
    let mounted!: ReturnType<typeof def.mount>;
    await wrap(() => (mounted = def.mount(fresh())));
    expect(el.textContent).not.toBe('');
    await wrap(() => mounted.unmount());
    expect(el.textContent).toBe('');
  });
});
