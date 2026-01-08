export default function convertToUTFMB3(input) {
  return input
    .normalize('NFKD')
    .replace(/[\u{10000}-\u{10FFFF}]/gu, '')
    .normalize('NFC');
}
