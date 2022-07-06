import { createSyncFn } from "../index.js";
console.log(createSyncFn(new URL("./worker.mjs", import.meta.url))(1))