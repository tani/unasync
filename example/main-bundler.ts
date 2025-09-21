import { createSyncFn } from "../index.ts";

// Example 1: Traditional approach with file path (existing behavior)
{
  using syncFn = createSyncFn(import.meta.resolve("./worker.ts"));
  console.log("File path approach:", syncFn(1));
}

// Example 2: Bundler-friendly approach with Worker instance (new behavior)
{
  // In a bundler environment, the worker code would be inlined
  // and a Worker instance created from a blob or data URL
  const workerCode = `
    import { runAsWorker } from "${import.meta.resolve("../index.ts")}";
    runAsWorker(async (x) => {
      await new Promise((resolve) => setTimeout(() => resolve(1), 100));
      return x + 10;
    });
  `;
  
  const blob = new Blob([workerCode], { type: "application/javascript" });
  const workerUrl = URL.createObjectURL(blob);
  const worker = new Worker(workerUrl, { type: "module" });
  
  using syncFn = createSyncFn(worker);
  console.log("Worker instance approach:", syncFn(5));
  
  // Clean up the blob URL
  URL.revokeObjectURL(workerUrl);
}