import type { ComponentManifest, PropManifest } from './types';

export interface PanelOptions {
  /** Starting values, keyed by prop name. Missing ones show the declared default. */
  values?: Record<string, unknown>;
  /** Called on every edit with the prop that changed and its new raw value. */
  onChange(key: string, value: string | number | boolean): void;
}

export interface Panel {
  element: HTMLElement;
  /** Updates the controls to show `values`, without calling `onChange`. */
  setValues(values: Record<string, unknown>): void;
  destroy(): void;
}

let nextId = 0;

function createControl(prop: PropManifest, value: unknown, id: string, emit: (v: string | number | boolean) => void) {
  const s = prop.settings as Record<string, any>;
  let input: HTMLInputElement | HTMLSelectElement;
  let read: () => string | number | boolean;
  let write: (v: unknown) => void;

  switch (prop.type) {
    case 'Number': {
      const el = document.createElement('input');
      el.type = 'number';
      if (s.min !== undefined) el.min = String(s.min);
      if (s.max !== undefined) el.max = String(s.max);
      el.step = s.decimals ? String(10 ** -s.decimals) : '1';
      input = el;
      read = () => el.valueAsNumber;
      write = (v) => (el.value = String(v));
      break;
    }
    case 'Boolean': {
      const el = document.createElement('input');
      el.type = 'checkbox';
      input = el;
      read = () => el.checked;
      write = (v) => (el.checked = Boolean(v));
      break;
    }
    case 'Variant': {
      const el = document.createElement('select');
      for (const option of s.options as string[]) el.append(new Option(option, option));
      input = el;
      read = () => el.value;
      write = (v) => (el.value = String(v));
      break;
    }
    case 'Color': {
      const el = document.createElement('input');
      el.type = 'color';
      input = el;
      read = () => el.value;
      write = (v) => (el.value = String(v));
      break;
    }
    default: {
      const el = document.createElement('input');
      el.type = 'text';
      input = el;
      read = () => el.value;
      write = (v) => (el.value = String(v));
    }
  }

  input.id = id;
  input.dataset.prop = prop.key;
  write(value);
  input.addEventListener('input', () => emit(read()));
  return { input, write };
}

/**
 * Builds a properties panel from a manifest: one control per exposed prop, grouped by `group`.
 * Pure DOM, so it works the same next to a React, Solid, Vue or plain-JS component.
 */
export function createPanel(manifest: Pick<ComponentManifest, 'props'>, options: PanelOptions): Panel {
  const root = document.createElement('div');
  root.className = 'tinker-panel';
  const writers = new Map<string, (v: unknown) => void>();
  const uid = `tinker-${nextId++}`;

  const groups = new Map<string, PropManifest[]>();
  for (const prop of manifest.props) {
    const key = prop.group ?? '';
    groups.set(key, [...(groups.get(key) ?? []), prop]);
  }

  for (const [group, list] of groups) {
    const section = document.createElement('fieldset');
    if (group) section.append(Object.assign(document.createElement('legend'), { textContent: group }));

    for (const prop of list) {
      const id = `${uid}-${prop.key}`;
      const row = document.createElement('div');
      row.className = 'tinker-row';
      const label = Object.assign(document.createElement('label'), { htmlFor: id, textContent: prop.name });
      if (prop.tooltip) label.title = prop.tooltip;

      const value = options.values && prop.key in options.values ? options.values[prop.key] : prop.defaultValue;
      const { input, write } = createControl(prop, value, id, (v) => options.onChange(prop.key, v));
      writers.set(prop.key, write);
      row.append(label, input);
      section.append(row);
    }
    root.append(section);
  }

  return {
    element: root,
    setValues(values) {
      for (const [key, write] of writers) if (key in values) write(values[key]);
    },
    destroy: () => root.remove(),
  };
}
