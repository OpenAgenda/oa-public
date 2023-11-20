export default function addText(doc, cursor, text, options = {}) {
  const {
    fontSize,
    color,
    base = {
      color: '#000000',
      fontSize: 12,
    },
    width,
    underline,
    link,
    align,
    simulate = false,
    bold = false,
  } = options;

  const regularFontPath = './fonts/Assistant-Regular.ttf';
  const boldFontPath = './fonts/Assistant-Bold.ttf';

  const selectedFont = bold ? boldFontPath : regularFontPath;

  if (!simulate) {
    doc
      .fillColor(color ?? base.color)
      .font(selectedFont)
      .fontSize(fontSize ?? base.fontSize)
      .text(text, cursor.x, cursor.y, { width, underline, link, align });
  }

  return {
    width: doc.widthOfString(text),
    height: doc.heightOfString(text, { width }),
  };
}
