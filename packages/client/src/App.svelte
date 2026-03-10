<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import Dashboard from './components/Dashboard.svelte';
  import Canvas from './components/Canvas.svelte';
  import TestPanel from './components/TestPanel.svelte';
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

  <TestPanel />
</div>

<style>
  .app {
    display: grid;
    grid-template-columns: 260px 1fr;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
    background: #0a0a0f;
  }

  .sidebar-left {
    height: 100vh;
    overflow: hidden;
  }

  .canvas-area {
    height: 100vh;
    overflow: hidden;
  }
</style>