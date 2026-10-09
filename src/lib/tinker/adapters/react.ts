import { createElement, type ComponentType } from 'react';
import { createRoot } from 'react-dom/client';
import { defineComponent } from '../definition';
import type { ComponentData, ComponentDefinition, Renderer } from '../types';

const render = <P extends object>(): Renderer<ComponentType<P>, P> => (Component, el, props) => {
  const root = createRoot(el);
  root.render(createElement(Component, props as P));
  return {
    update: (next) => root.render(createElement(Component, next as P)),
    unmount: () => root.unmount(),
  };
};

/** Exposes a React component's props. */
export function declareComponent<P extends object>(
  component: ComponentType<P>,
  data: ComponentData<P>,
): ComponentDefinition<P, ComponentType<P>> {
  return defineComponent('react', component, data, render<P>());
}
