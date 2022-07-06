import test from 'node:test';
import assert from 'node:assert/strict';
import { createSyncFn } from './index.js';
test("Example", () => {
    assert.equal(createSyncFn(new URL("./example/worker.js", import.meta.url))(1), 2)
})