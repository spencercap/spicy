import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import solid from '@astrojs/solid-js';
import vue from '@astrojs/vue';

// React and Solid both use JSX, so each integration only handles files in its own `react/` or `solid/` folder.
export default defineConfig({
  integrations: [
    react({ include: ['**/components/**/react/*'] }),
    solid({ include: ['**/components/**/solid/*'] }),
    vue(),
  ],
});
