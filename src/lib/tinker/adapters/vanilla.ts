import { defineComponent } from '../definition';
import type { ComponentData, ComponentDefinition, Renderer, RendererHandle } from '../types';

/**
 * A component with no framework: draws into `el` once, then updates in place.
 * This is also the escape hatch for any framework without a built-in adapter
 * (Svelte, Lit, Alpine, ...): mount it inside `setup` and forward `update` and `unmount`.
 */
export type VanillaComponent<P> = (el: Element, props: Partial<P>) => RendererHandle<P>;

const render = <P extends object>(): Renderer<VanillaComponent<P>, P> => (component, el, props) =>
  component(el, props);

/** Exposes a framework-free component's props. */
export function declareComponent<P extends object>(
  component: VanillaComponent<P>,
  data: ComponentData<P>,
): ComponentDefinition<P, VanillaComponent<P>> {
  return defineComponent('vanilla', component, data, render<P>());
}
