import type { ComponentManifest, PropManifest } from './types';

type Raw = string | number | boolean;

export interface PanelOptions {
  /** Starting values, keyed by prop name. Missing ones show the declared default. */
  values?: Record<string, unknown>;
  /** Called on every edit, and on reset, with the prop that changed and its new raw value. */
  onChange(key: string, value: Raw): void;
}

export interface Panel {
  element: HTMLElement;
  /** Updates the controls to show `values`, without calling `onChange`. */
  setValues(values: Record<string, unknown>): void;
  destroy(): void;
}

let nextId = 0;

type Control = {
  /** The element placed in the row's field area. */
  field: HTMLElement;
  /** Shows a value in the control. */
  write(value: unknown): void;
};

function input(type: string) {
  const el = document.createElement('input');
  el.type = type;
  return el;
}

/** Builds the control for one prop. `emit` is called with the raw value on every edit. */
function createControl(prop: PropManifest, id: string, emit: (v: Raw) => void): Control {
  const s = prop.settings as Record<string, any>;

  const bind = (el: HTMLInputElement | HTMLSelectElement, read: () => Raw) => {
    el.id = id;
    el.dataset.prop = prop.key;
    el.addEventListener('input', () => emit(read()));
  };

  switch (prop.type) {
    case 'Number': {
      const el = input('number');
      bind(el, () => el.valueAsNumber);
      if (s.min !== undefined) el.min = String(s.min);
      if (s.max !== undefined) el.max = String(s.max);
      el.step = s.decimals ? String(10 ** -s.decimals) : '1';
      return { field: el, write: (v) => (el.value = String(v)) };
    }
    case 'Boolean': {
      const el = input('checkbox');
      bind(el, () => el.checked);
      el.className = 'tinker-switch';
      const field = document.createElement('span');
      field.className = 'tinker-boolean';
      const hint = document.createElement('span');
      hint.className = 'tinker-hint';
      const show = () => (hint.textContent = (el.checked ? s.trueLabel : s.falseLabel) ?? '');
      el.addEventListener('input', show);
      field.append(el, hint);
      return {
        field,
        write(v) {
          el.checked = Boolean(v);
          show();
        },
      };
    }
    case 'Variant': {
      const el = document.createElement('select');
      bind(el, () => el.value);
      for (const value of s.options as string[]) {
        const option = document.createElement('option');
        option.value = option.textContent = value;
        el.append(option);
      }
      return { field: el, write: (v) => (el.value = String(v)) };
    }
    case 'Color': {
      const el = input('color');
      bind(el, () => el.value);
      el.className = 'tinker-swatch';
      const field = document.createElement('span');
      field.className = 'tinker-color';
      const hex = document.createElement('span');
      hex.className = 'tinker-hex';
      el.addEventListener('input', () => (hex.textContent = el.value));
      field.append(el, hex);
      return {
        field,
        write(v) {
          el.value = String(v);
          hex.textContent = el.value;
        },
      };
    }
    default: {
      const el = input('text');
      bind(el, () => el.value);
      return { field: el, write: (v) => (el.value = String(v)) };
    }
  }
}

/**
 * Builds a properties panel from a manifest, in the style of a design tool's inspector:
 * collapsible sections by `group`, a label and a control per exposed prop, and a dot beside
 * any prop that differs from its default (click it to reset).
 *
 * Pure DOM, so it works the same next to a React, Solid, Vue or plain-JS component.
 * Style it with `panel.css`; every color is a `--tinker-*` custom property.
 */
export function createPanel(manifest: Pick<ComponentManifest, 'props'>, options: PanelOptions): Panel {
  const root = document.createElement('div');
  root.className = 'tinker-panel';
  const uid = `tinker-${nextId++}`;

  const current = new Map<string, unknown>();
  const rows = new Map<string, { control: Control; row: HTMLElement; prop: PropManifest }>();

  const refresh = (key: string) => {
    const entry = rows.get(key)!;
    entry.row.toggleAttribute('data-modified', current.get(key) !== entry.prop.defaultValue);
  };

  const groups = new Map<string, PropManifest[]>();
  for (const prop of manifest.props) {
    const name = prop.group ?? '';
    groups.set(name, [...(groups.get(name) ?? []), prop]);
  }

  for (const [group, list] of groups) {
    const section = document.createElement(group ? 'details' : 'div');
    section.className = 'tinker-section';
    if (group) {
      section.setAttribute('open', '');
      const summary = document.createElement('summary');
      summary.textContent = group;
      section.append(summary);
    }
    const body = document.createElement('div');
    body.className = 'tinker-body';
    section.append(body);

    for (const prop of list) {
      const id = `${uid}-${prop.key}`;
      const row = document.createElement('div');
      row.className = 'tinker-row';

      const reset = document.createElement('button');
      reset.type = 'button';
      reset.className = 'tinker-reset';
      reset.setAttribute('aria-label', `Reset ${prop.name}`);
      reset.title = 'Reset to default';

      const label = document.createElement('label');
      label.htmlFor = id;
      label.textContent = prop.name;
      if (prop.tooltip) label.title = prop.tooltip;

      const control = createControl(prop, id, (value) => {
        current.set(prop.key, value);
        refresh(prop.key);
        options.onChange(prop.key, value);
      });
      const start = options.values && prop.key in options.values ? options.values[prop.key] : prop.defaultValue;
      control.write(start);
      current.set(prop.key, start);

      reset.addEventListener('click', () => {
        control.write(prop.defaultValue);
        current.set(prop.key, prop.defaultValue);
        refresh(prop.key);
        options.onChange(prop.key, prop.defaultValue as Raw);
      });

      const labelCell = document.createElement('div');
      labelCell.className = 'tinker-label';
      labelCell.append(reset, label);
      const fieldCell = document.createElement('div');
      fieldCell.className = 'tinker-field';
      fieldCell.append(control.field);

      row.append(labelCell, fieldCell);
      body.append(row);
      rows.set(prop.key, { control, row, prop });
      refresh(prop.key);
    }
    root.append(section);
  }

  return {
    element: root,
    setValues(values) {
      for (const [key, { control }] of rows) {
        if (!(key in values)) continue;
        control.write(values[key]);
        current.set(key, values[key]);
        refresh(key);
      }
    },
    destroy: () => root.remove(),
  };
}
