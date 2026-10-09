# Spicy Astro Playground

- Always use pnpm, never npm or yarn (`pnpm install`, `pnpm add`, `pnpm dev`, `pnpm build`, `pnpm dlx`, `pnpm view`).
- Stack: Astro (static site) with React, Solid and Vue integrations.
- Checks: `pnpm test` (vitest), `pnpm check` (astro check, also type-checks .ts/.vue), `pnpm build`. Run all three before pushing: the build alone does not type-check.

## Branches

- `production` is the production branch and the repo's default. Don't push to it or open feature PRs against it unless asked.
- `staging` is where work lands (it replaced `main`; there is no `main` branch). Branch off `staging` and open PRs into `staging`.
- Work from a new `claude/<topic>` branch and open a PR for each change; don't push straight to `staging`. A merged PR is finished, so start follow-ups on a fresh branch off the latest `staging`.

## Structure

```
src/
  layouts/       Shared page layouts
  pages/         One file per route (the sitemap page lists these automatically)
  lib/
    tinker/      Standalone library for exposing chosen component props to clients (see its README).
                 Must not import from the rest of the app, so it can be published later.
  components/
    ui/          Generic, reusable pieces (Accordion, Nav, EditorShell)
    <name>/      One folder per demo component, e.g. chip/, gradient/
      <Name>.astro, <Name>Demo.astro, <name>.css
      <name>.props.ts   Exposed-props schema, shared by every framework version
      react/     React version (.tsx) and <Name>.tinker.ts
      solid/     Solid version (.tsx, starts with `/** @jsxImportSource solid-js */`) and <Name>.tinker.ts
      vue/       Vue version (.vue) and <Name>.tinker.ts
      vanilla/   Plain-DOM version (.ts) and <Name>.tinker.ts
```

- React and Solid both use JSX. `astro.config.mjs` scopes each integration to its own `react/` or `solid/` folder, so framework components must live there.
- Adding a component to the Components page: create `src/components/<name>/`, put its docs and live examples in `<Name>Demo.astro`, and wrap it in an `<Accordion title="<Name>">` in `src/pages/components.astro`.
- Adding a top-level page: add it to the `links` array in `src/components/ui/Nav.astro`. The nav collapses into a menu button below 44rem, so extra links don't cost horizontal space on mobile.
- Keep every framework version of a component on the same props and the same shared stylesheet. Put anything they must agree on (defaults, the CSS variables they set) in `<name>.props.ts` and import it, rather than repeating it per framework.
- Live demos: build the editor from the tinker panel, not by hand. Mount each framework's `.tinker.ts` definition and drive them all from `createPanel`, inside `<EditorShell>` (see `gradient/GradientDemo.astro`). Use `contained` when it sits inside an accordion. (`chip/` predates this and has hand-written editors.)
