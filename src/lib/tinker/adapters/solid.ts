import { createComponent, render as solidRender } from 'solid-js/web';
import { createStore, reconcile } from 'solid-js/store';
import type { Component } from 'solid-js';
import { defineComponent } from '../definition';
import type { ComponentData, ComponentDefinition, Renderer } from '../types';

const render = <P extends object>(): Renderer<Component<P>, P> => (Comp, el, props) => {
  // A store keeps props reactive, so `update` changes only what depends on the changed values.
  const [store, setStore] = createStore({ ...props } as P);
  const dispose = solidRender(() => createComponent(Comp, store), el);
  return {
    update: (next) => setStore(reconcile({ ...next } as P)),
    unmount: dispose,
  };
};

/** Exposes a Solid component's props. */
export function declareComponent<P extends object>(
  component: Component<P>,
  data: ComponentData<P>,
): ComponentDefinition<P, Component<P>> {
  return defineComponent('solid', component, data, render<P>());
}
