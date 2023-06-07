export default function customFirst(a, b) {
  if (a.type === 'custom' && b.type !== 'custom') {
    return -1;
  }
  if (a.type !== 'custom' && b.type === 'custom') {
    return 1;
  }

  return 0;
}
