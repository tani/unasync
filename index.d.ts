/**
 * @typedef {{dispose: () => void}} Disposable
 * @param {string | URL} filename
 * @param {number} bufferSize
 * @returns {Function & Disposable}
 */
export function createSyncFn(filename: string | URL, bufferSize?: number): Function & Disposable;
/**
 * @param {(...args: any[]) => Promise<any>} workerAsyncFn
 */
export function runAsWorker(workerAsyncFn: (...args: any[]) => Promise<any>): void;
export type Disposable = {
    dispose: () => void;
};
