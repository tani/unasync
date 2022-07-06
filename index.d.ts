/**
 * @param {string | URL} filename
 * @param {number} bufferSize
 * @returns {(...args: any[]) => any}
 */
export function createSyncFn(filename: string | URL, bufferSize?: number): (...args: any[]) => any;
/**
 * @param {(...args: any[]) => Promise<any>} workerAsyncFn
 */
export function runAsWorker(workerAsyncFn: (...args: any[]) => Promise<any>): void;
