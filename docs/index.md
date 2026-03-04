---
layout: home

hero:
  name: Pixel Office
  text: Real-time AI agent activity visualizer
  tagline: Connect any agent framework and watch them work in a cozy pixel office.
  actions:
    - theme: brand
      text: Explore the Architecture
      link: /architecture
    - theme: alt
      text: View on GitHub
      link: https://github.com/dEviLb0/pixel-office

features:
  - title: Universal Protocol
    details: A single typed PixelEvent protocol that any agent framework can speak — whether Python, TypeScript, or anything in between.
  - title: Clean Layered Client
    details: Three strict layers — WebSocket → Stores → PixiJS — keep concerns separated and each layer independently testable.
  - title: Adapter-first design
    details: Plug-and-play adapters for CrewAI and Claude Code, with zero changes to your existing agent code.
---

## What is Pixel Office?

**Pixel Office** is a universal visualization layer for AI agent systems. It renders a live, pixel-art office scene where every running agent gets its own desk — and you can watch them think, use tools, and finish tasks in real time.

The project is structured as a monorepo with a shared typed protocol that any agent framework can use to publish activity events. A standalone WebSocket server receives those events and broadcasts them to all connected browser clients. The client renders the office scene using PixiJS backed by Svelte reactive stores.

Supported agent frameworks:
- **CrewAI** (Python) — via the native `crewai_event_bus` hook
- **Claude Code** (TypeScript/CLI) — via a JSONL file watcher with zero agent modification

See the [Architecture page](/architecture) for a deeper look at how everything fits together.
