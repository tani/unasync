# UnAsync

Synchronously execute asynchronous functions on browsers, Node.js, and Deno.
This package is a successor of [synckit](https://npmjs.com/package/synckit) and
[sync-threads](https://npmjs.com/package/sync-threads).

## Usage

https://jsr.io/@tani/unasync

This package provides two functions `runAsWorker` and `createSyncFn`.

1. Wrap an asynchronous function by `runAsWorker`
2. Create a synchronous function by `createSyncFn`

```js
//worker.js
import { runAsWorker } from "unasync";
runAsWorker(async (x) => {
  await new Promise((resolve) => setTimeout(() => resolve(1), 1000));
  return x + 1;
});
```

```js
//main.js
import { createSyncFn } from "unasync";
const syncFn = createSyncFn(import.meta.resolve("./worker.js"));
console.log(syncFn(1)); // 2
syncFn.dispose(); // terminate the worker thread
```

## Technical Details

In the modern JavaScript platform, we can use shared memory `SharedArrayBuffer`.
we employ it as a semaphore. First, we lock the semaphore to suspend the main
thread and run the asyncrhonous function in the worker thread. After the
execution, we unlock the semaphore to resume the main thread.

The strong point of this idea, we do not need to modify event-loop in the target
virtual machine by FFI.

## Copyright and License

(c) 2024 TANIGUCHI Masaya, MIT License
