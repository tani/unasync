// (c) 2024 TANIGUCHI Masaya https://git.io/mit-license

// @ts-ignore - web-worker doesn't provide TypeScript types
import Worker from 'web-worker';

type SyncFn = (...args: unknown[]) => unknown;
type AsyncFn = (...args: unknown[]) => Promise<unknown>;

/**
 * Create a synchronous function from a worker script
 */
export function createSyncFn(
  source: string | URL | Worker,
  bufferSize: number = 64 * 1024,
): SyncFn & Disposable {
  // Create or use existing worker
  // web-worker handles both Node.js and browser environments
  const worker = source instanceof Worker
    ? source
    : new Worker(source instanceof URL ? source.href : source, { type: 'module' } as any);

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
    const data = JSON.parse(decoder.decode(binary));

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
 * Run as a worker - call this in your worker script
 */
export function runAsWorker(workerAsyncFn: AsyncFn): void {
  // web-worker provides addEventListener in both Node.js and browser
  if (typeof globalThis !== 'undefined' && typeof addEventListener === 'function') {
    addEventListener('message', async (ev: MessageEvent) => {
      const { args, buffer } = ev.data;
      let data, didThrow = false;

      try {
        data = await workerAsyncFn(...args);
      } catch (err) {
        data = err;
        didThrow = true;
      }

      const encoder = new TextEncoder();
      const binary = encoder.encode(JSON.stringify(data));
      new Uint8Array(buffer).set(binary, 4);

      const semaphore = new Int32Array(buffer);
      Atomics.store(semaphore, 0, didThrow ? -binary.length : binary.length);
      Atomics.notify(semaphore, 0);
    });
  }
}
