/**
 * This function finds all occurrences of uppercase letters (due to camel-casing) in a
 * property name and replaces them with an underscore and the lowercase version of the capital letter
 */
export function toSnake(s: string) {
  return s.replace(/([A-Z])/g, ($1) => {
    return $1.replace($1, '_' + $1.toLowerCase());
  });
}

/**
 * This functions recursively iterates through the passed object and applies snake-casing to
 * each of its property names (even if they are deeply nested; handles arrays as well)
 */
export function keysToSnake(o: any) {
  if (o === Object(o) && !Array.isArray(o) && typeof o !== 'function') {
    const n = {};
    Object.keys(o).forEach((k) => {
      n[toSnake(k)] = keysToSnake(o[k]);
    });
    return n;
  } else if (Array.isArray(o)) {
    return o.map((i) => {
      return keysToSnake(i);
    });
  }
  return o;
}
