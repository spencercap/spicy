import { describe } from './describe';
import { resolveValues } from './resolve';
import type { ComponentData, ComponentDefinition, MountedComponent, Renderer } from './types';

/**
 * Used by framework adapters. Wraps a component and its exposed-props config into a
 * definition that can be mounted the same way no matter which framework it is built with.
 */
export function defineComponent<P extends object, C>(
  framework: string,
  component: C,
  data: ComponentData<P>,
  render: Renderer<C, P>,
): ComponentDefinition<P, C> {
  const config = data.props ?? {};
  const resolve = (values?: Record<string, unknown>) => resolveValues<P>(config as never, values);

  return {
    ...data,
    framework,
    component,
    manifest: describe(data, framework),
    resolve,
    mount(el, values = {}, fixed = {}): MountedComponent {
      let current = values;
      const merge = (resolved: Partial<P>) => ({ ...fixed, ...resolved });
      const handle = render(component, el, merge(resolve(current)));
      return {
        update(patch) {
          current = { ...current, ...patch };
          handle.update(merge(resolve(current)));
        },
        unmount: () => handle.unmount(),
      };
    },
  };
}
