export default function isValidDate(d) {
  return d instanceof Date && !Number.isNaN(Number(d));
}
