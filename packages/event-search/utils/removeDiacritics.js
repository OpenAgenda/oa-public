/**
 * Removes diacritics from a string by replacing accented letters with their non-accented equivalents.
 * @param {string} str - The input string to process
 * @returns {string} - The string with diacritics removed
 */
function removeDiacritics(str) {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export default removeDiacritics;
