import { createSyncFn } from "../index.mjs";
console.log(createSyncFn(new URL("./worker.mjs", import.meta.url))(1))