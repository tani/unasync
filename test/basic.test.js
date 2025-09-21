import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createSyncFn } from '../dist/index.js';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

describe('unasync basic tests', () => {
  test('should execute synchronously with file path', () => {
    const workerPath = join(__dirname, 'fixtures', 'simple-worker.js');
    const syncFn = createSyncFn(workerPath);
    
    const result = syncFn(5);
    assert.equal(result, 10, 'Should double the input');
    
    syncFn[Symbol.dispose]();
  });

  test('should handle async operations in worker', () => {
    const workerPath = join(__dirname, 'fixtures', 'async-worker.js');
    const syncFn = createSyncFn(workerPath);
    
    const result = syncFn(3);
    assert.equal(result, 9, 'Should triple the input after async delay');
    
    syncFn[Symbol.dispose]();
  });

  test('should handle errors thrown in worker', () => {
    const workerPath = join(__dirname, 'fixtures', 'error-worker.js');
    const syncFn = createSyncFn(workerPath);
    
    let errorThrown = false;
    try {
      syncFn('test');
    } catch (err) {
      errorThrown = true;
    }
    
    assert.equal(errorThrown, true, 'Should propagate worker errors');
    
    syncFn[Symbol.dispose]();
  });

  test('should handle complex data types', () => {
    const workerPath = join(__dirname, 'fixtures', 'complex-worker.js');
    const syncFn = createSyncFn(workerPath);
    
    const input = {
      numbers: [1, 2, 3],
      nested: { value: 'test' },
      date: new Date('2024-01-01')
    };
    
    const result = syncFn(input);
    assert.deepEqual(result.numbers, [2, 4, 6], 'Should double array values');
    assert.equal(result.nested.value, 'TEST', 'Should uppercase string');
    assert.equal(result.processed, true, 'Should add processed flag');
    
    syncFn[Symbol.dispose]();
  });

  test('should support custom buffer size', () => {
    const workerPath = join(__dirname, 'fixtures', 'simple-worker.js');
    const customBufferSize = 128 * 1024; // 128KB
    const syncFn = createSyncFn(workerPath, customBufferSize);
    
    const result = syncFn(7);
    assert.equal(result, 14, 'Should work with custom buffer size');
    
    syncFn[Symbol.dispose]();
  });
});