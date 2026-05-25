import { defineConfig } from 'vitepress'

const guideLinksEn = [
  { text: 'Introduction', link: '/introduction' },
  { text: 'Getting Started', link: '/getting-started' },
  { text: 'How It Works', link: '/how-it-works' },
  { text: 'CLI Reference', link: '/cli-reference' },
  { text: 'Project Layout', link: '/project-layout' },
  { text: 'Project Documentation', link: '/project-documentation' },
  { text: 'IDE Adapters', link: '/ide-adapters' },
  { text: 'Linear Integration', link: '/linear-integration' },
  { text: 'Design Principles', link: '/design-principles' },
  { text: 'Troubleshooting', link: '/troubleshooting' },
]

const guideLinksEs = [
  { text: 'Introducción', link: '/es/introduction' },
  { text: 'Primeros pasos', link: '/es/getting-started' },
  { text: 'Cómo funciona', link: '/es/how-it-works' },
  { text: 'Referencia CLI', link: '/es/cli-reference' },
  { text: 'Layout del proyecto', link: '/es/project-layout' },
  { text: 'Documentación del proyecto', link: '/es/project-documentation' },
  { text: 'Adaptadores IDE', link: '/es/ide-adapters' },
  { text: 'Integración Linear', link: '/es/linear-integration' },
  { text: 'Principios de diseño', link: '/es/design-principles' },
  { text: 'Solución de problemas', link: '/es/troubleshooting' },
]

export default defineConfig({
  title: 'SpecFlow',
  description:
    'Spec-driven multi-agent workflow for Cursor with optional Linear issue sync via MCP.',
  lang: 'en-US',
  srcDir: 'docs',
  base: '/specflow/',
  cleanUrls: true,
  lastUpdated: true,

  ignoreDeadLinks: [
    /CHANGELOG/,
    /LICENSE/,
    /README/,
    /\.\.\/es\//,
    /\.\.\/en\//,
  ],

  rewrites: {
    'en/README.md': 'index.md',
    'en/:rest*': ':rest*',
    'es/README.md': 'es/index.md',
  },

  head: [['link', { rel: 'icon', href: '/specflow/favicon.ico' }]],

  themeConfig: {
    logo: { text: 'SpecFlow' },
    siteTitle: 'SpecFlow',
    socialLinks: [
      { icon: 'github', link: 'https://github.com/ceatoleii/specflow' },
    ],
    search: { provider: 'local' },
  },

  locales: {
    root: {
      label: 'English',
      lang: 'en',
      link: '/',
      themeConfig: {
        nav: [
          { text: 'Guide', link: '/introduction', activeMatch: '/(introduction|getting-started|how-it-works|cli-reference|project-layout|project-documentation|ide-adapters|linear-integration|design-principles|troubleshooting)' },
          { text: 'npm', link: 'https://www.npmjs.com/package/@ceatoleii/specflow' },
        ],
        sidebar: [{ text: 'Guide', items: guideLinksEn }],
        editLink: {
          pattern:
            'https://github.com/ceatoleii/specflow/edit/main/docs/en/:path',
          text: 'Edit this page on GitHub',
        },
        footer: {
          message: 'Released under the MIT License.',
          copyright: 'Copyright © ceatoleii',
        },
      },
    },
    es: {
      label: 'Español',
      lang: 'es',
      link: '/es/',
      themeConfig: {
        nav: [
          { text: 'Guía', link: '/es/introduction', activeMatch: '/es/(introduction|getting-started|how-it-works|cli-reference|project-layout|project-documentation|ide-adapters|linear-integration|design-principles|troubleshooting)' },
          { text: 'npm', link: 'https://www.npmjs.com/package/@ceatoleii/specflow' },
        ],
        sidebar: [{ text: 'Guía', items: guideLinksEs }],
        editLink: {
          pattern:
            'https://github.com/ceatoleii/specflow/edit/main/docs/es/:path',
          text: 'Editar esta página en GitHub',
        },
        footer: {
          message: 'Publicado bajo licencia MIT.',
          copyright: 'Copyright © ceatoleii',
        },
      },
    },
  },
})
