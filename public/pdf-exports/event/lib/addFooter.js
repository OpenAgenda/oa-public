import addText from "./addText.js";

export default function addFooter(doc, content, bottomMargin ) {

  const yPosition = doc.page.height - bottomMargin;

  addText(doc, { x: 0, y: yPosition }, {
    content,
    align: 'center',
    width: doc.page.width,
  });

  return {
    width: doc.widthOfString(content),
    height: doc.heightOfString(content),
  };
}
