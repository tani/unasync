// (c) 2024 TANIGUCHI Masaya https://git.io/mit-license

import { serialize, deserialize } from './serializer.js';

type SyncFn = (...args: unknown[]) => unknown;
type AsyncFn = (...args: unknown[]) => Promise<unknown>;

/**
 * Create a synchronous function from a worker script (Web Worker implementation)
 */
export function createSyncFn(
  source: string | URL | Worker,
  bufferSize: number = 64 * 1024,
): SyncFn & Disposable {
  // Create or use existing worker
  const worker = source instanceof Worker
    ? source
    : new Worker(source, { type: 'module' });

  const syncFn: SyncFn & Disposable = (...args: unknown[]): unknown => {
    const buffer = new SharedArrayBuffer(bufferSize);
    const semaphore = new Int32Array(buffer);
    
    worker.postMessage({ args, buffer });
    
    worker.addEventListener('error', (err) => {
      throw err;
    });
    
    // Wait for worker to complete
    Atomics.wait(semaphore, 0, 0);
    
    let length = semaphore[0];
    let didThrow = false;
    if (length < 0) {
      didThrow = true;
      length *= -1;
    }
    
    const decoder = new TextDecoder();
    const binary = new Uint8Array(buffer).slice(4, 4 + length);
    const data = deserialize(decoder.decode(binary));
    
    if (didThrow) {
      throw data;
    }
    return data;
  };

  syncFn[Symbol.dispose] = () => {
    worker.terminate();
  };

  return syncFn;
}

/**
 * Run as a worker (Web Worker implementation)
 */
export function runAsWorker(workerAsyncFn: AsyncFn) {
  if (typeof self !== 'undefined' && self.addEventListener) {
    self.addEventListener('message', async (ev: MessageEvent) => {
      const { args, buffer } = ev.data;
      let data, didThrow = false;
      
      try {
        data = await workerAsyncFn(...args);
      } catch (err) {
        data = err;
        didThrow = true;
      }
      
      const encoder = new TextEncoder();
      const binary = encoder.encode(serialize(data));
      new Uint8Array(buffer).set(binary, 4);
      
      const semaphore = new Int32Array(buffer);
      Atomics.store(semaphore, 0, didThrow ? -binary.length : binary.length);
      Atomics.notify(semaphore, 0);
    });
  }
}