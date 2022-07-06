const { createSyncFn } = require("../index.cjs");
const syncFn = createSyncFn(`${__dirname}/worker.cjs`);
console.log(syncFn(1))
syncFn.dispose()