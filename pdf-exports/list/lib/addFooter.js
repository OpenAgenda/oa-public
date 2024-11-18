import addText from "./addText.js";

export default function addFooter(doc, text, bottomMargin, options = {}) {
  const {
    base = {
      color: '#413a42',
      fontSize: 10,
    },
    simulate = false,
    fontSize,
  } = options;

  const yPosition = doc.page.height - bottomMargin;

  addText(doc, { x: 0, y: yPosition }, text, {
    width: doc.page.width,
    base,
    fontSize,
    align: 'center',
    simulate,
  });

  return {
    width: doc.widthOfString(text),
    height: doc.heightOfString(text),
  };
}
