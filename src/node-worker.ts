// (c) 2024 TANIGUCHI Masaya https://git.io/mit-license

import { Worker as NodeWorker, isMainThread, parentPort } from 'node:worker_threads';
import { fileURLToPath } from 'node:url';
import { serialize, deserialize } from './serializer.js';

type SyncFn = (...args: unknown[]) => unknown;
type AsyncFn = (...args: unknown[]) => Promise<unknown>;

/**
 * Create a synchronous function from a worker script (Node.js implementation)
 */
export function createSyncFn(
  source: string | URL | NodeWorker,
  bufferSize: number = 64 * 1024,
): SyncFn & Disposable {
  // Convert URL to string if needed
  const workerPath = source instanceof URL ? fileURLToPath(source) : source;
  
  // Create or use existing worker
  const worker = typeof workerPath === 'string' 
    ? new NodeWorker(workerPath)
    : workerPath as NodeWorker;

  const syncFn: SyncFn & Disposable = (...args: unknown[]): unknown => {
    const buffer = new SharedArrayBuffer(bufferSize);
    const semaphore = new Int32Array(buffer);
    
    worker.postMessage({ args, buffer });
    
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
 * Run as a worker (Node.js implementation)
 */
export function runAsWorker(workerAsyncFn: AsyncFn) {
  if (!isMainThread && parentPort) {
    parentPort.on('message', async (ev: any) => {
      const { args, buffer } = ev;
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