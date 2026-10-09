# Spicy Astro Playground

A simple [Astro](https://astro.build) site for experimenting with components.

## What's happening here

We're building components that other people can safely tweak. The idea is borrowed from
[Webflow's code components](https://developers.webflow.com/code-components): you build a component once,
then pick which of its settings (text, numbers, colors, and so on) show up in a side panel for someone to edit.
Anything you don't list stays locked.

Here that idea lives outside of Webflow, so it works in Astro and in other tools too.

The example is a small badge called a **Chip**, with a label, a count and a color. The same Chip is built in
React, Solid, Vue and plain JavaScript, and one properties panel on the right edits all of them at once.

## demo

production: 
[https://spicy-space.pages.dev/](https://spicy-space.pages.dev/)

staging: 
[https://staging.spicy-space.pages.dev/](https://staging.spicy-space.pages.dev/)

(+ previews are deployed per PR)

tinker w props example:
[https://spicy-space.pages.dev/tinker/](https://spicy-space.pages.dev/tinker/)

<img width="1200" height="599" alt="Screenshot 1768" src="https://github.com/user-attachments/assets/aacb1b73-6aea-4130-8738-d182e2efbc71" />

## Where to look

- `/tinker` is the demo above. `/components` shows the Chip on its own.
- `src/lib/tinker/` is the reusable part, with its own [README](src/lib/tinker/README.md) for the details.

## Commands

| Command        | Action                                 |
| :------------- | :------------------------------------- |
| `pnpm install` | Install dependencies                   |
| `pnpm dev`     | Start dev server at `localhost:4321`   |
| `pnpm build`   | Build the production site to `./dist/` |
| `pnpm preview` | Preview the production build locally   |
| `pnpm test`    | Run the tests                          |
| `pnpm check`   | Type-check the project                 |
