<script lang="ts">
  import Canvas from '@pixel-office/client/src/components/Canvas.svelte';
  import TestPanel from './components/TestPanel.svelte';
</script>

<div class="app">
  <Canvas />
  <TestPanel />
</div>

<style>
  .app {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    position: relative;
  }
</style>