import test from 'node:test';
import assert from 'node:assert/strict';
import { createSyncFn } from './index.mjs';
test("Example", () => {
    assert.equal(createSyncFn(new URL("./example/worker.mjs", import.meta.url))(1), 2)
})