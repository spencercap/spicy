/** The kinds of control a prop can be exposed as. */
export type PropKind = 'Text' | 'Number' | 'Boolean' | 'Variant' | 'Color';

/** The runtime value a component receives for each kind. */
export interface PropValues {
  Text: string;
  Number: number;
  Boolean: boolean;
  Variant: string;
  /** A `#rrggbb` hex string. */
  Color: string;
}

/** Kind-specific options (everything besides name, group, tooltip and defaultValue). */
export interface PropSettings {
  Text: Record<never, never>;
  Number: {
    /** Lower values are clamped up to this. */
    min?: number;
    /** Higher values are clamped down to this. */
    max?: number;
    /** Maximum number of decimals; longer values are rounded. */
    decimals?: number;
  };
  Boolean: {
    trueLabel?: string;
    falseLabel?: string;
  };
  Variant: {
    /** The allowed values. The first is used when no default is given. */
    options: readonly string[];
  };
  Color: Record<never, never>;
}

/** One exposed prop: what the panel shows and how its value is validated. */
export interface PropDefinition<K extends PropKind = PropKind> {
  type: K;
  /** Label shown in the panel. */
  name: string;
  /** Panel section this prop is listed under. */
  group?: string;
  tooltip?: string;
  defaultValue?: PropValues[K];
  settings: PropSettings[K];
}

/** The prop kinds that can drive a component prop of TypeScript type `T`. */
export type KindFor<T> = { [K in PropKind]: T extends PropValues[K] ? K : never }[PropKind];

/**
 * Which of a component's props are exposed, and as what.
 * Keys are the component's own prop names; a prop left out is not exposed.
 * A prop can only be given a kind that matches its TypeScript type.
 */
export type PropsConfig<P> = {
  [K in keyof P]?: PropDefinition<KindFor<NonNullable<P[K]>>>;
};

export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

/** A prop as it appears in a manifest: plain JSON, no component code. */
export interface PropManifest {
  /** The component's prop name. */
  key: string;
  type: PropKind;
  name: string;
  group?: string;
  tooltip?: string;
  /** Always present: the declared default, or the kind's fallback. */
  defaultValue: JsonValue;
  settings: Record<string, JsonValue>;
}

/** Everything a dashboard needs to build a panel and validate input, with no framework code. */
export interface ComponentManifest {
  name: string;
  description?: string;
  group?: string;
  framework: string;
  props: PropManifest[];
}

/** Human-supplied metadata for a component, passed to `declareComponent`. */
export interface ComponentData<P> {
  name: string;
  description?: string;
  group?: string;
  /** The props to expose. Anything not listed here cannot be changed from outside. */
  props?: PropsConfig<P>;
}

/** A live instance of a component. */
export interface MountedComponent {
  /** Merges `values` into the current ones, then re-validates and re-renders. */
  update(values: Record<string, unknown>): void;
  unmount(): void;
}

/** What a framework adapter provides: render once, then update props in place. */
export interface RendererHandle<P> {
  update(props: Partial<P>): void;
  unmount(): void;
}

export type Renderer<C, P> = (component: C, el: Element, props: Partial<P>) => RendererHandle<P>;

export interface ComponentDefinition<P, C = unknown> extends ComponentData<P> {
  /** Which framework adapter created this definition. */
  framework: string;
  /** The original component, untouched. */
  component: C;
  /** JSON description of the exposed props. Safe to store or send to a client. */
  manifest: ComponentManifest;
  /** Validates untrusted values against the exposed props. See `resolveValues`. */
  resolve(values?: Record<string, unknown>): Partial<P>;
  /**
   * Renders into `el`. `values` is untrusted input: it is validated, defaults are filled in,
   * and anything not exposed is dropped. `fixed` is trusted, developer-supplied props
   * for the component's non-exposed props.
   */
  mount(el: Element, values?: Record<string, unknown>, fixed?: Partial<P>): MountedComponent;
}
