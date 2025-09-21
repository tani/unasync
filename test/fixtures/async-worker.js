import { runAsWorker } from '../../dist/index.js';

runAsWorker(async (x) => {
  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 50));
  return x * 3;
});