# Spicy

- Always use pnpm, never npm or yarn (`pnpm install`, `pnpm add`, `pnpm dev`, `pnpm build`, `pnpm dlx`, `pnpm view`).
- Stack: Astro (static site) with React and Solid integrations.

## Structure

```
src/
  layouts/       Shared page layouts
  pages/         One file per route (the sitemap page lists these automatically)
  components/
    ui/          Generic, reusable pieces (Accordion, Nav)
    <name>/      One folder per demo component, e.g. chip/
      <Name>.astro, <Name>Editor.astro, <Name>Demo.astro, <name>.css
      react/     React version (.tsx)
      solid/     Solid version (.tsx, starts with `/** @jsxImportSource solid-js */`)
```

- React and Solid both use JSX. `astro.config.mjs` scopes each integration to its own `react/` or `solid/` folder, so framework components must live there.
- Adding a component to the Components page: create `src/components/<name>/`, put its docs and live examples in `<Name>Demo.astro`, and wrap it in an `<Accordion title="<Name>">` in `src/pages/components.astro`.
- Adding a top-level page: add it to the `links` array in `src/components/ui/Nav.astro`. The nav collapses into a menu button below 36rem, so extra links don't cost horizontal space on mobile.
- Keep the Astro, React and Solid versions of a component on the same props and the same shared stylesheet.
