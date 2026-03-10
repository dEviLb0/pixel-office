<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { PixiApp } from '../pixi/PixiApp';
  import { OfficeRenderer } from '../pixi/OfficeRenderer';

  let canvasEl: HTMLCanvasElement;
  let pixiApp: PixiApp;
  let officeRenderer: OfficeRenderer;

  onMount(async () => {
    pixiApp = new PixiApp();
    await pixiApp.init(canvasEl);

    officeRenderer = new OfficeRenderer(pixiApp);
    officeRenderer.init();

    pixiApp.ticker.add(() => {
      officeRenderer.update();
    });
  });

  onDestroy(() => {
    officeRenderer?.destroy();
    pixiApp?.destroy();
  });
</script>

<canvas bind:this={canvasEl} class="canvas" />

<style>
  .canvas {
    width: 100%;
    height: 100%;
    display: block;
  }
</style>