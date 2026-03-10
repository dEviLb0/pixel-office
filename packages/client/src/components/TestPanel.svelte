<script lang="ts">
  import { agents } from '../stores/agents';  // chemin relatif

  let counter = 0;

  function spawnWorker() {
    counter++;
    agents.agentStarted({
      type: 'agent_started',
      agent_id: `worker-${counter}`,
      name: `Worker ${counter}`,
      role: 'worker',
      timestamp: new Date().toISOString(),
    });
  }

  function spawnOrchestrator() {
    counter++;
    agents.agentStarted({
      type: 'agent_started',
      agent_id: `orchestrator-${counter}`,
      name: `Orchestrator ${counter}`,
      role: 'orchestrator',
      timestamp: new Date().toISOString(),
    });
  }

  function setThinking() {
    agents.agentThinking({
      agent_id: 'worker-1',
      timestamp: new Date().toISOString(),
    });
  }

  function setToolRunning() {
    agents.agentToolStart({
      agent_id: 'worker-1',
      timestamp: new Date().toISOString(),
    });
  }

  function setError() {
    agents.agentError({
      type: 'agent_error',
      agent_id: 'worker-1',
      error: 'Test error',
      timestamp: new Date().toISOString(),
    });
  }

  function removeWorker() {
    agents.agentRemoved({
      type: 'agent_removed',
      agent_id: 'worker-1',
      timestamp: new Date().toISOString(),
    });
  }

  function reset() {
    agents.reset();
    counter = 0;
  }
</script>

<div class="panel">
  <h3>🧪 Test Panel</h3>

  <section>
    <p>Spawn</p>
    <button on:click={spawnWorker}>+ Worker (bleu)</button>
    <button on:click={spawnOrchestrator}>+ Orchestrateur (violet)</button>
  </section>

  <section>
    <p>Statuts sur worker-1</p>
    <button on:click={setThinking}>💭 Thinking</button>
    <button on:click={setToolRunning}>⚙️ Tool running</button>
    <button on:click={setError}>❌ Error</button>
  </section>

  <section>
    <p>Actions</p>
    <button on:click={removeWorker}>🗑 Remove worker-1</button>
    <button class="danger" on:click={reset}>🔄 Reset tout</button>
  </section>
</div>

<style>
  .panel {
    position: fixed;
    top: 16px;
    right: 16px;
    background: rgba(0, 0, 0, 0.85);
    color: white;
    padding: 16px;
    border-radius: 8px;
    font-family: monospace;
    font-size: 12px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-width: 180px;
  }

  h3 {
    margin: 0;
    font-size: 13px;
  }

  section {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  p {
    margin: 0;
    color: #aaa;
    font-size: 11px;
  }

  button {
    background: #2c2c2c;
    color: white;
    border: 1px solid #444;
    padding: 6px 10px;
    border-radius: 4px;
    cursor: pointer;
    font-family: monospace;
    font-size: 11px;
  }

  button:hover {
    background: #3c3c3c;
  }

  button.danger {
    border-color: #e74c3c;
    color: #e74c3c;
  }

  button.danger:hover {
    background: #3c1c1c;
  }
</style>