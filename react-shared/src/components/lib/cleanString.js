export default function cleanString(str) {
  if (typeof str !== 'string') return str;

  const charCodesToClean = [
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
    769, // U+0301
  ];

  const charsToClean = charCodesToClean.map((char) =>
    String.fromCharCode(char));

  return str.replace(new RegExp(`[${charsToClean.join('')}]`, 'g'), ' ');
}
