/**
 * Trims spaces in the provided string such that the string has no spaces in front,
 * behind or more than one space characer in the middle of the text contained within the string.
 * @param str string to be trimmed
 */
export function trimString(str: string): string {
  return str
    .trim()
    .replace(/\s+/g, ' ');
}
