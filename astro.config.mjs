import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import solid from '@astrojs/solid-js';

// Both frameworks use JSX, so each integration only handles its own folder.
export default defineConfig({
  integrations: [
    react({ include: ['**/components/react/*'] }),
    solid({ include: ['**/components/solid/*'] }),
  ],
});
