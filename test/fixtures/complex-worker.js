import { runAsWorker } from '../../dist/index.js';

runAsWorker(async (data) => {
  return {
    numbers: data.numbers.map(n => n * 2),
    nested: {
      value: data.nested.value.toUpperCase()
    },
    processed: true
  };
});