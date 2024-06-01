export default function goToNextLine(cursor, offsetY, options = {}) {
  const { x } = options;

  cursor.y += offsetY;
  if (x !== undefined) {
    cursor.x = x;
  }
}
