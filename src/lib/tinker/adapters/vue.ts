import { createApp, h, shallowReactive, type Component } from 'vue';
import { defineComponent } from '../definition';
import type { ComponentData, ComponentDefinition, Renderer } from '../types';

const render = <P extends object>(): Renderer<Component, P> => (Comp, el, props) => {
  const state = shallowReactive({ ...props } as Record<string, unknown>);
  const app = createApp({ render: () => h(Comp, state) });
  app.mount(el);
  return {
    update(next) {
      for (const key of Object.keys(state)) if (!(key in next)) delete state[key];
      Object.assign(state, next);
    },
    unmount: () => app.unmount(),
  };
};

/** Exposes a Vue component's props. `P` is the props shape the component accepts. */
export function declareComponent<P extends object>(
  component: Component,
  data: ComponentData<P>,
): ComponentDefinition<P, Component> {
  return defineComponent('vue', component, data, render<P>());
}
