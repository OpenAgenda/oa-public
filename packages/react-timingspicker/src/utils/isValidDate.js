export default function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}
