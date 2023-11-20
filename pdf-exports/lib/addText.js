export default function addText(doc, cursor, text, options = {}) {
  const {
    fontSize,
    color,
    base = {
      color: '#000000',
      fontFamily: 'Helvetica',
      fontSize: 12,
    },
    fontFamily,
    width,
    underline,
    link,
    align,
    simulate = false,
  } = options;

  if (!simulate) {
    doc
      .fillColor(color ?? base.color)
      .font(fontFamily ?? base.fontFamily)
      .fontSize(fontSize ?? base.fontSize)
      .text(text, cursor.x, cursor.y, { width, underline, link, align });
  }

  return {
    width: doc.widthOfString(text),
    height: doc.heightOfString(text, { width }),
  };
}
