export default function cleanString(str) {
  if (typeof str !== 'string') return str;
  const charsToClean = [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    11, // VT
    12, // form feed - https://www.compart.com/en/unicode/U+000C
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
    0x202f, // Narrow no-break space
  ];

  // Escaped rather than literal, so the class cannot read as a combined
  // character once the combining range below is appended.
  const escaped = charsToClean
    .map((code) => `\\u${code.toString(16).padStart(4, '0')}`)
    .join('');

  // Compose first: a combining mark over a capital (`E` + U+0301 rather than
  // `É`) has no GPOS anchor in the Assistant fonts, and fontkit dereferences
  // that null anchor instead of skipping it, taking the whole render down.
  // NFC turns those into the single glyphs the fonts carry, keeping the accent
  // — stripping the mark, as this used to do for U+0301 and U+0302 only, both
  // lost the accent and left U+0300 and U+0308 free to crash. Marks with no
  // composed form are dropped afterwards, since those would still crash.
  return str
    .normalize('NFC')
    .replace(new RegExp(`[${escaped}\\u0300-\\u036f]`, 'g'), '');
}
