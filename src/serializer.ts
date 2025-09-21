// (c) 2024 TANIGUCHI Masaya https://git.io/mit-license

/**
 * Simple serialization that handles basic types, arrays, objects, and errors
 * Replaces flatted library with a simpler implementation
 */

export function serialize(value: unknown): string {
  return JSON.stringify(value, (key, val) => {
    // Handle errors specially
    if (val instanceof Error) {
      return {
        __type: 'Error',
        name: val.name,
        message: val.message,
        stack: val.stack
      };
    }
    // Handle undefined
    if (val === undefined) {
      return { __type: 'undefined' };
    }
    // Handle functions (just return a placeholder)
    if (typeof val === 'function') {
      return { __type: 'function', name: val.name || 'anonymous' };
    }
    // Handle dates
    if (val instanceof Date) {
      return { __type: 'Date', value: val.toISOString() };
    }
    // Handle RegExp
    if (val instanceof RegExp) {
      return { __type: 'RegExp', source: val.source, flags: val.flags };
    }
    return val;
  });
}

export function deserialize(text: string): unknown {
  return JSON.parse(text, (key, val) => {
    if (val && typeof val === 'object' && '__type' in val) {
      switch (val.__type) {
        case 'Error': {
          const error = new Error(val.message);
          error.name = val.name;
          if (val.stack) error.stack = val.stack;
          return error;
        }
        case 'undefined':
          return undefined;
        case 'Date':
          return new Date(val.value);
        case 'RegExp':
          return new RegExp(val.source, val.flags);
        case 'function':
          // Can't deserialize functions, return a placeholder
          return () => { throw new Error(`Cannot call serialized function: ${val.name}`); };
      }
    }
    return val;
  });
}