/**
 * Replace occurrences of `É` with `É` in the given text.
 * @param {string} text - The text to clean.
 * @returns {string} The cleaned text.
 */
export default function cleanText(text) {
  return text
    ? text
      .replace(/É/g, 'É')
      .replace(/\u2028/g, '\n')
      .replace(/Î/g, 'Î')
    : text;
}
