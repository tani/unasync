import { runAsWorker } from '../../dist/index.js';

runAsWorker(async (x) => {
  return x * 2;
});