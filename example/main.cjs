const { createSyncFn } = require("../index.cjs");
console.log(createSyncFn(`${__dirname}/worker.cjs`)(1))