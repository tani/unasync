// (c) 2024 TANIGUCHI Masaya https://git.io/mit-license.

// Default fallback - re-export from node-worker
// Conditional exports will override this in appropriate environments
export { createSyncFn, runAsWorker } from './node-worker.js';
