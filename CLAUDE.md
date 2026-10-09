# Spicy

- Always use pnpm, never npm or yarn (`pnpm install`, `pnpm add`, `pnpm dev`, `pnpm build`, `pnpm dlx`, `pnpm view`).
- Stack: Astro (static site) with React and Solid integrations.

## Structure

```
src/
  layouts/       Shared page layouts
  pages/         One file per route (the sitemap page lists these automatically)
  components/
    ui/          Generic, reusable pieces (e.g. Accordion)
    <name>/      One folder per demo component, e.g. chip/
      <Name>.astro, <Name>Editor.astro, <Name>Demo.astro, <name>.css
      react/     React version (.tsx)
      solid/     Solid version (.tsx, starts with `/** @jsxImportSource solid-js */`)
```

- React and Solid both use JSX. `astro.config.mjs` scopes each integration to its own `react/` or `solid/` folder, so framework components must live there.
- Adding a component to the Components page: create `src/components/<name>/`, put its docs and live examples in `<Name>Demo.astro`, and wrap it in an `<Accordion title="<Name>">` in `src/pages/components.astro`.
- Keep the Astro, React and Solid versions of a component on the same props and the same shared stylesheet.
