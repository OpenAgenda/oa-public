/**
 * Normalize the given text for rendering.
 *
 * A combining mark over a capital (`E` + U+0301 rather than `É`) has no GPOS
 * anchor in the Assistant fonts, and fontkit dereferences that null anchor
 * instead of skipping it, which takes the whole render down. Composing to NFC
 * turns those sequences into the single glyphs the fonts actually carry, and
 * covers every accent rather than the handful we hardcoded one crash at a time.
 * @param {string} text - The text to clean.
 * @returns {string} The cleaned text.
 */
export default function cleanText(text) {
  return text
    ? `${text}`
      .normalize('NFC')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\u2028/g, '\n')
    : text;
}
