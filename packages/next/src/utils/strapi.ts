export function color(c) {
  if (!c) {
    return;
  }
  return [undefined, null].includes(c.swatch)
    ? c.name
    : `${c.name}.${c.swatch.replace('s', '')}`;
}
