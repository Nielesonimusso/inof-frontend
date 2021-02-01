/**
 * This function finds all occurrences of an underscore followed by a lowercase letter
 * (due to snake-casing) in a property name and replaces them with the uppercase version
 * of the letter in question
 */
export function toCamel(s: string) {
  return s.replace(/([_][a-z])/gi, ($1) => {
    return $1.toUpperCase().replace('_', '');
  });
}

/**
 * This functions recursively iterates through the passed object and applies camel-casing to
 * each of its property names (even if they are deeply nested; handles arrays as well)
 */
export function keysToCamel(o: any) {
  if (o === Object(o) && !Array.isArray(o) && typeof o !== 'function') {
    const n = {};
    Object.keys(o).forEach((k) => {
      n[toCamel(k)] = keysToCamel(o[k]);
    });
    return n;
  } else if (Array.isArray(o)) {
    return o.map((i) => {
      return keysToCamel(i);
    });
  }
  return o;
}
