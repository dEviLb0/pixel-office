<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import Dashboard from './components/Dashboard.svelte';
  import Canvas from './components/Canvas.svelte';
  import LogPanel from './components/LogPanel.svelte';
  import { ws } from './ws/socket';

  onMount(() => {
    ws.connect();
  });

  onDestroy(() => {
    ws.close();
  });
</script>

<div class="app">
  <aside class="sidebar-left">
    <Dashboard />
  </aside>

  <main class="canvas-area">
    <Canvas />
  </main>

  <aside class="sidebar-right">
    <LogPanel />
  </aside>
</div>

<style>
  .app {
    display: grid;
    grid-template-columns: 220px 1fr 280px;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
    background: #1a1a2e;
  }

  .sidebar-left,
  .sidebar-right {
    height: 100vh;
    overflow: hidden;
  }

  .canvas-area {
    height: 100vh;
    overflow: hidden;
  }
</style>