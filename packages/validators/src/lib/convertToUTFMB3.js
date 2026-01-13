export default function convertToUTFMB3(input) {
  return input
    .normalize('NFKD')
    .replace(/[\u{10000}-\u{10FFFF}]/gu, '') // Remove supplementary plane characters
    .replace(/[\uFE0E\uFE0F]/g, '') // Remove emoji variation selectors
    .normalize('NFC');
}
