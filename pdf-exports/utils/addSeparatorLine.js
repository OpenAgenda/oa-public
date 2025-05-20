export default function addSeparatorLine(doc, cursor, options = {}) {
  const { width, weight = 1, padding = 0 } = options;

  const size = {
    width:
      width
      ?? doc.page.width
        - doc.page.margins.left
        - doc.page.margins.right
        - padding * 2,
    height: weight + padding * 2,
  };

  const lineY = cursor.y + padding;

  doc
    .moveTo(cursor.x + padding, lineY)
    .lineTo(cursor.x + size.width, lineY)
    .lineWidth(weight)
    .stroke();

  return size;
}
