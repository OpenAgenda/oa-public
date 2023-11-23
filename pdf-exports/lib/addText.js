export default function addText(doc, cursor, text, options = {}) {
  const {
    fontSize,
    color,
    base = {
      color: '#413a42',
      fontSize: 12,
    },
    width,
    underline,
    link,
    align,
    simulate = false,
    bold = false,
    medium = false,
  } = options;

  let selectedFont;

  const regularFontPath = './fonts/Assistant-Regular.ttf';
  const mediumFontPath = './fonts/Assistant-Medium.ttf';
  const boldFontPath = './fonts/Assistant-Bold.ttf';

  if (bold) {
    selectedFont = boldFontPath;
  } else if (medium) {
    selectedFont = mediumFontPath;
  } else {
    selectedFont = regularFontPath;
  }

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
