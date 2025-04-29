export default function roundToDecimal(n, d = 2) {
  return Math.ceil(n * 10 ** d) / 10 ** d;
}
