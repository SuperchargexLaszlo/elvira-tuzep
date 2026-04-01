import path from 'path';
import { fileURLToPath } from 'url';

import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';
import partytown from '@astrojs/partytown';
import icon from 'astro-icon';
import compress from 'astro-compress';
import type { AstroIntegration } from 'astro';

import astrowind from './vendor/integration';

import { readingTimeRemarkPlugin, responsiveTablesRehypePlugin, lazyImagesRehypePlugin } from './src/utils/frontmatter';

import preact from '@astrojs/preact';

import netlify from '@astrojs/netlify';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const hasExternalScripts = false;
const whenExternalScripts = (items: (() => AstroIntegration) | (() => AstroIntegration)[] = []) =>
  hasExternalScripts ? (Array.isArray(items) ? items.map((item) => item()) : [items()]) : [];

export default defineConfig({
   output: "static",

  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),  
    mdx(), 
    icon({
      include: {
        tabler: ['*'],
        'flat-color-icons': [
          'template',
          'gallery',
          'approval',
          'document',
          'advertising',
          'currency-exchange',
          'voice-presentation',
          'business-contact',
          'database',
        ],
      },
    }),
    sitemap({
        filter: (page) =>
          !page.includes("/admin") &&
          !page.includes("/koszonjuk") &&
          !page.includes("/tudastar/tag") &&
          !/\/tudastar\/\d/.test(page),
        lastmod: new Date(),
        changefreq: "daily",
        entryLimit: 500,
      }),
    
    partytown({
        config: {
          forward: ['dataLayer.push'],
        },
      }),
    
    compress({
      CSS: true,
      HTML: {
        'html-minifier-terser': {
          removeAttributeQuotes: false,
        },
      },
      Image: false,
      JavaScript: true,
      SVG: false,
      Logger: 1,
    }), 
    
    astrowind({
      config: './src/config.yaml',
    }), 
    
    preact()
  ],

  image: {
    domains: ['cdn.pixabay.com'],
  },

  markdown: {
    remarkPlugins: [readingTimeRemarkPlugin],
    rehypePlugins: [responsiveTablesRehypePlugin, lazyImagesRehypePlugin],
  },

  vite: {
    plugins: [
      {
        name: 'fix-medusa-esm-dir-imports',
        enforce: 'pre' as const,
        resolveId(id: string, importer: string | undefined) {
          if (!importer?.includes('@medusajs/js-sdk')) return;
          if (['./admin', './auth', './client', './store'].includes(id)) {
            return path.resolve(path.dirname(importer), id.slice(2) + '/index.js');
          }
        }
      }
    ],
    resolve: {
      alias: {
        '~': path.resolve(__dirname, './src'),
      },
    },
    optimizeDeps: {
      include: ["@medusajs/js-sdk"],
    },
    ssr: {
      noExternal: ["@medusajs/js-sdk"],
    },
  },

  adapter: netlify(),
});