export default function roundToDecimal(n, d = 2) {
  if (n instanceof Object) {
    return Object.keys(n).reduce(
      (rounded, k) => ({
        ...rounded,
        [k]: typeof n[k] === 'number' ? roundToDecimal(n[k], d) : n[k],
      }),
      {},
    );
  }
  return Math.ceil(n * 10 ** d) / 10 ** d;
}
