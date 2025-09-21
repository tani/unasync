import { runAsWorker } from '../../dist/node-worker.js';

runAsWorker(async (x) => {
  return x * 2;
});