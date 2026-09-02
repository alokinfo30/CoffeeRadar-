/**
 * Enterprise Defense-in-Depth Security: InputSanitizer
 * Implements recursive payload filtering against prototype pollution (__proto__, constructor, prototype)
 * and deep object structure poisoning.
 */

const DANGEROUS_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

export class InputSanitizer {
  /**
   * Recursively sanitizes any JavaScript object or array, stripping dangerous prototype pollution keys.
   */
  public static sanitize<T = any>(data: T): T {
    if (data === null || data === undefined) {
      return data;
    }

    if (typeof data !== 'object') {
      if (typeof data === 'string') {
        // Strip null bytes
        return data.replace(/\0/g, '') as unknown as T;
      }
      return data;
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.sanitize(item)) as unknown as T;
    }

    // Process object properties safely
    const cleanObject: Record<string, any> = Object.create(null);

    for (const key of Object.keys(data)) {
      if (DANGEROUS_KEYS.has(key)) {
        // Drop dangerous keys immediately
        continue;
      }

      // Prevent prototype pollution via accessor descriptors
      const value = (data as any)[key];
      if (value !== undefined) {
        cleanObject[key] = this.sanitize(value);
      }
    }

    return cleanObject as T;
  }

  /**
   * Detects if an incoming payload contains prototype pollution injection attempts.
   */
  public static detectsPrototypePollution(rawJsonStringOrObj: any): { polluted: boolean; keysFound: string[] } {
    const keysFound: string[] = [];

    if (typeof rawJsonStringOrObj === 'string') {
      if (/__proto__/i.test(rawJsonStringOrObj)) keysFound.push('__proto__');
      if (/"constructor"\s*:/i.test(rawJsonStringOrObj)) keysFound.push('constructor');
      if (/"prototype"\s*:/i.test(rawJsonStringOrObj)) keysFound.push('prototype');
    } else if (typeof rawJsonStringOrObj === 'object' && rawJsonStringOrObj !== null) {
      const inspect = (obj: any, depth = 0) => {
        if (!obj || typeof obj !== 'object' || depth > 10) return;
        for (const k of Object.getOwnPropertyNames(obj)) {
          if (DANGEROUS_KEYS.has(k)) {
            keysFound.push(k);
          }
          if (typeof obj[k] === 'object' && obj[k] !== null) {
            inspect(obj[k], depth + 1);
          }
        }
      };
      inspect(rawJsonStringOrObj);
    }

    return {
      polluted: keysFound.length > 0,
      keysFound
    };
  }
}
