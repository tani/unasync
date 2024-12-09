import { createSyncFn } from "../index.ts";
{
  using syncFn = createSyncFn(import.meta.resolve("./worker.ts"));
  console.log(syncFn(1));
}
