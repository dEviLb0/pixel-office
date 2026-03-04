import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Pixel Office',
  description: 'Real-time AI agent activity visualizer',
  base: '/pixel-office/',

  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Architecture', link: '/architecture' },
      { text: 'Protocol', link: '/protocol' },
      { text: 'Client', link: '/client' },
      { text: 'Server', link: '/server' },
      { text: 'Adapters', link: '/adapters/' },
      { text: 'ADRs', link: '/decisions/' },
    ],

    sidebar: [
      {
        text: 'Introduction',
        items: [
          { text: 'Home', link: '/' },
          { text: 'Architecture', link: '/architecture' },
        ],
      },
      {
        text: 'Protocol',
        items: [
          { text: 'PixelEvent Protocol', link: '/protocol' },
        ],
      },
      {
        text: 'Packages',
        items: [
          { text: 'Client', link: '/client' },
          { text: 'Server', link: '/server' },
        ],
      },
      {
        text: 'Adapters',
        items: [
          { text: 'Overview', link: '/adapters/' },
          { text: 'CrewAI', link: '/adapters/crewai' },
          { text: 'Claude Code', link: '/adapters/claude-code' },
        ],
      },
      {
        text: 'Architecture Decision Records',
        items: [
          { text: 'What are ADRs?', link: '/decisions/' },
          { text: 'ADR 001 — Monorepo', link: '/decisions/001-monorepo' },
          { text: 'ADR 002 — PixelEvent Protocol', link: '/decisions/002-pixelevent-protocol' },
          { text: 'ADR 003 — WebSocket Architecture', link: '/decisions/003-websocket-architecture' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/dEviLb0/pixel-office' },
    ],
  },
})
