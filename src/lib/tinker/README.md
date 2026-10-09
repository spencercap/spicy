# Tinker

Declare which props of a component clients may change, and get a JSON manifest, a validator and a
uniform `mount()` for it, whatever framework the component is written in.

Modeled on [Webflow Code Components](https://developers.webflow.com/code-components) (`declareComponent` + `props.*`
builders), with the same split: the schema is plain data, and each framework only provides a renderer.
Built to be lifted out into its own package: nothing in here imports from the rest of the app.

## The idea

```ts
// chip.props.ts: written once, shared by every framework
import { props, type PropsConfig } from '@spicy/tinker';

export const chipProps = {
  label: props.Text({ name: 'Label', group: 'Content', defaultValue: 'Chip' }),
  count: props.Number({ name: 'Count', group: 'Content', min: 0, max: 999, decimals: 0 }),
  color: props.Color({ name: 'Color', group: 'Style', defaultValue: '#e4572e' }),
} satisfies PropsConfig<ChipProps>;

// react/Chip.tinker.ts
import { declareComponent } from '@spicy/tinker/react';
export default declareComponent<ChipProps>(Chip, { name: 'Chip', props: chipProps });
```

Only the props listed in `props` can be changed from outside. Everything else on the component stays
fixed, and anything a client sends for it is dropped.

```ts
const chip = definition.mount(element, clientValues);   // validated, defaults filled in
chip.update({ count: 5 });                               // merged into current values, re-validated
chip.unmount();

definition.manifest;                                     // JSON: build a panel, store it, send it
definition.resolve(untrustedInput);                      // validate without rendering
```

## Entry points

| Import                  | What                                                         | Needs |
| :---------------------- | :----------------------------------------------------------- | :---- |
| `@spicy/tinker`         | `props`, `describe`, `resolveValues`, `defineComponent`, types | nothing |
| `@spicy/tinker/panel`   | `createPanel(manifest, { onChange })`: an inspector-style properties panel from a manifest (import `panel.css` too) | a DOM |
| `@spicy/tinker/react`   | `declareComponent` for React components                      | `react`, `react-dom` |
| `@spicy/tinker/solid`   | `declareComponent` for Solid components                      | `solid-js` |
| `@spicy/tinker/vue`     | `declareComponent` for Vue components                        | `vue` |
| `@spicy/tinker/vanilla` | `declareComponent` for plain-DOM components                  | nothing |

Each adapter imports only its own framework, so a consumer only needs the frameworks it uses.

## Prop kinds

| Kind       | Component receives | Options                                    |
| :--------- | :----------------- | :----------------------------------------- |
| `Text`     | `string`           |                                            |
| `Number`   | `number`           | `min`, `max` (clamped), `decimals` (rounded) |
| `Boolean`  | `boolean`          | `trueLabel`, `falseLabel`                  |
| `Variant`  | `string`           | `options` (required; value must be one)    |
| `Color`    | `string`           | `#rgb` / `#rrggbb`, normalized to `#rrggbb` |

Every builder also takes `name` (panel label), `group`, `tooltip` and `defaultValue`.

The config is checked against the component's own props: a `number` prop can only be given
`Number`, a `string` prop can be `Text`, `Variant` or `Color`, and a key that isn't a prop of the
component is an error.

## The panel

`createPanel(manifest, { values, onChange })` returns `{ element, setValues, destroy }`. It is pure DOM, so it
sits next to a React, Solid, Vue or plain-JS preview alike.

- collapsible sections by `group` (props without one sit above, unsectioned), a label and a control per prop
- a blue dot beside any prop that differs from its default; click it to reset
- controls per kind: text and number inputs (number gets `min`/`max`/`step`), a select, a color swatch with its hex, a switch with `trueLabel`/`falseLabel`
- dark by default; theme it by overriding the `--tinker-*` custom properties in `panel.css`

`onChange` receives the raw edited value. Pass it to `mount(...).update(...)`, which validates.

## Validation (`resolveValues`)

Untrusted input in, safe values out:

- only exposed props come out; other keys are dropped (inherited and `__proto__` keys are ignored)
- every exposed prop comes out; missing or invalid values fall back to the default, then to a neutral
  value (`''`, the minimum or `0`, `false`, the first option, `#000000`)
- numbers are clamped and rounded, `NaN` and `Infinity` are rejected, numeric strings are accepted

It accepts either a definition's `props` config or a stored `manifest.props`, so a server can validate
client payloads from the manifest alone, without loading any framework code.

## Adding another framework

An adapter is one function: render once, then update props in place.

```ts
import { defineComponent } from '../definition';

export function declareComponent<P extends object>(component: MyComponent<P>, data: ComponentData<P>) {
  return defineComponent('my-framework', component, data, (Comp, el, props) => {
    const instance = renderMyFramework(Comp, el, props);
    return { update: (next) => instance.setProps(next), unmount: () => instance.destroy() };
  });
}
```

`vanilla` is the escape hatch for anything without an adapter (Svelte, Lit, Alpine): mount the
component yourself inside a `VanillaComponent`.

## Not included yet

Webflow also has `Link`, `Image`, `RichText`, `Slot`, `Id`, `TextNode` and `Attributes` props. These
are left out because they need either an asset picker or framework-specific nodes (slots). The kind
list is a single table in `types.ts` plus a case in `resolve.ts` and `panel.ts`, so they can be added.

## Develop

`pnpm test` runs the unit tests (core validation plus every adapter against the real framework),
and `pnpm check` type-checks everything. The demo is the `/tinker` page.
