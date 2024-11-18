export default function addSeparatorLine(doc, cursor, options = {}) {
  const { width, weight = 1 } = options;

  const separatorWidth = width ?? doc.page.width;

  doc
    .moveTo(cursor.x, cursor.y)
    .lineTo(cursor.x + separatorWidth, cursor.y)
    .lineWidth(weight)
    .stroke();

  return {
    width: separatorWidth,
    height: weight,
  };
}
