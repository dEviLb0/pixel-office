<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { PixiApp } from '../pixi/PixiApp';
  import { CharacterManager } from '../pixi/CharacterManager';

  let canvasEl: HTMLCanvasElement;
  let pixiApp: PixiApp;
  let characterManager: CharacterManager;

  onMount(async () => {
    pixiApp = new PixiApp();
    await pixiApp.init(canvasEl);

    characterManager = new CharacterManager(pixiApp.layers.furniture, pixiApp.layers.characters);
    characterManager.init();

    pixiApp.ticker.add(() => {
      characterManager.update();
    });
  });

  onDestroy(() => {
    characterManager?.destroy();
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