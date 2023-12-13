import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

  const regularFontPath = `${__dirname}/../fonts/Assistant-Regular.ttf`;
  const mediumFontPath = `${__dirname}/../fonts/Assistant-Medium.ttf`;
  const boldFontPath = `${__dirname}/../fonts/Assistant-Bold.ttf`;

  if (bold) {
    selectedFont = boldFontPath;
  } else if (medium) {
    selectedFont = mediumFontPath;
  } else {
    selectedFont = regularFontPath;
  }

  doc
    .font(selectedFont)
    .fontSize(fontSize ?? base.fontSize);

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
