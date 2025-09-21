import { runAsWorker } from '../../dist/index.js';

runAsWorker(async (message) => {
  const error = new Error(`Worker error: ${message}`);
  // Ensure error properties are serializable
  error.name = 'WorkerError';
  throw error;
});