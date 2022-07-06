const { runAsWorker } = require("../index.cjs");
runAsWorker(async (x) => {
    await new Promise((resolve) => setTimeout(() => resolve(1), 1000));
    return x + 1
})