import { fallbackValue, resolveValues } from './resolve';
import type { ComponentManifest, JsonValue, PropDefinition } from './types';

/** Anything with a name and a props config: a definition's data, or just the config itself. */
export interface ManifestSource {
  name: string;
  description?: string;
  group?: string;
  props?: object;
}

/**
 * Builds the JSON description of a component's exposed props: everything a dashboard
 * needs to render a panel and validate input. Contains no component code.
 */
export function describe(data: ManifestSource, framework: string): ComponentManifest {
  const config = (data.props ?? {}) as Record<string, PropDefinition | undefined>;
  return {
    name: data.name,
    description: data.description,
    group: data.group,
    framework,
    props: Object.entries(config).flatMap(([key, def]) => {
      if (!def) return [];
      const settings = def.settings as Record<string, JsonValue>;
      // Run the declared default through the same validation as client input.
      const defaultValue = (resolveValues({ [key]: def })[key] ?? fallbackValue(def.type, settings)) as JsonValue;
      return [{ key, type: def.type, name: def.name, group: def.group, tooltip: def.tooltip, defaultValue, settings }];
    }),
  };
}
