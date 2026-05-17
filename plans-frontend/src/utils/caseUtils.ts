/**
 * Convert a single snake_case string to camelCase.
 * "clothing_type" → "clothingType"
 * Already-camelCase strings pass through unchanged.
 */
export const toCamel = (str: string): string =>
  str.replaceAll(/([-_][a-z])/g, (group) => group.toUpperCase().replace('-', '').replace('_', ''));

/**
 * Convert a single camelCase string to snake_case.
 * "clothingType" → "clothing_type"
 * Already-snake_case strings pass through unchanged.
 */
export const toSnake = (str: string): string =>
  str.replaceAll(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

/**
 * Recursively convert all keys in an object/array from snake_case to camelCase.
 * Skips File, Blob, and other non-plain objects.
 */
export const keysToCamel = (obj: unknown): unknown => {
  if (Array.isArray(obj)) {
    return obj.map(keysToCamel);
  }
  if (
    obj !== null &&
    typeof obj === 'object' &&
    !(obj instanceof File) &&
    !(obj instanceof Blob) &&
    !(obj instanceof FormData)
  ) {
    return Object.entries(obj as Record<string, unknown>).reduce<Record<string, unknown>>(
      (result, [key, value]) => {
        result[toCamel(key)] = keysToCamel(value);
        return result;
      },
      {}
    );
  }
  return obj;
};

/**
 * Recursively convert all keys in an object/array from camelCase to snake_case.
 * Skips File, Blob, and other non-plain objects.
 */
export const keysToSnake = (obj: unknown): unknown => {
  if (Array.isArray(obj)) {
    return obj.map(keysToSnake);
  }
  if (
    obj !== null &&
    typeof obj === 'object' &&
    !(obj instanceof File) &&
    !(obj instanceof Blob) &&
    !(obj instanceof FormData)
  ) {
    return Object.entries(obj as Record<string, unknown>).reduce<Record<string, unknown>>(
      (result, [key, value]) => {
        result[toSnake(key)] = keysToSnake(value);
        return result;
      },
      {}
    );
  }
  return obj;
};
