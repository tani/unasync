// (c) 2024 TANIGUCHI Masaya https://git.io/mit-license.
import * as flatted from "flatted";
import { Worker } from "@apacheli/web-workers";

/**
 * @typedef {{dispose: () => void}} Disposable
 * @param {string | URL} filename
 * @param {number} bufferSize
 * @returns {Function & Disposable}
 */
export function createSyncFn(
  filename: string | URL,
  bufferSize: number = 64 * 1024,
) {
  const worker = new Worker(filename, { type: "module" });
  const syncFn: Function & Disposable = (...args: unknown[]): unknown => {
    const buffer = new SharedArrayBuffer(bufferSize);
    const semaphore = new Int32Array(buffer);
    worker.postMessage({ args, buffer });
    worker.addEventListener("error", (err) => {
      throw err;
    });
    Atomics.wait(semaphore, 0, 0);
    let length = semaphore[0];
    let didThrow = false;
    if (length < 0) {
      didThrow = true;
      length *= -1;
    }
    const decoder = new TextDecoder();
    const binary = new Uint8Array(buffer).slice(4, 4 + length);
    const data = flatted.parse(decoder.decode(binary));
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
 * @param {(...args: unknown[]) => Promise<unknown>} workerAsyncFn
 */
export function runAsWorker(
  workerAsyncFn: (...args: unknown[]) => Promise<unknown>,
) {
  addEventListener("message", async (ev: any) => {
    const { args, buffer } = ev.data;
    let data, didThrow = false;
    try {
      data = await workerAsyncFn(...args);
    } catch (err) {
      data = err;
      didThrow = true;
    }
    const encoder = new TextEncoder();
    const binary = encoder.encode(flatted.stringify(data));
    new Uint8Array(buffer).set(binary, 4);
    const semaphore = new Int32Array(buffer);
    Atomics.store(semaphore, 0, didThrow ? -binary.length : binary.length);
    Atomics.notify(semaphore, 0);
  });
}
