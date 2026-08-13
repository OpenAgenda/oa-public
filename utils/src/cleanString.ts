// Codets de contrôle qui n'ont rien à faire dans un texte saisi : ils
// remontaient de copier-coller depuis des traitements de texte et cassaient
// l'export XLSX comme le rendu RSS.
const CHARS_TO_CLEAN = [
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  11, // VT
  12, // form feed — https://www.compart.com/en/unicode/U+000C
  15, // shift in
  18, // DC2
  19, // DC3
  21, // NAK
  24, // Cancel
  26, // SUB
  27, // Esc
  28, // File separator
  29, // GS group separator
  30, // RS
  31, // Information separator
  8232,
  8233,
  769, // U+0301
];

const PATTERN = new RegExp(
  `[${CHARS_TO_CLEAN.map((code) => String.fromCharCode(code)).join('')}]`,
  'g',
);

export default function cleanString<T>(str: T): T | string {
  if (typeof str !== 'string') return str;

  return str.replace(PATTERN, ' ');
}
