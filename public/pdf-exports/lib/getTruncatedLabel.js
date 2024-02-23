import addText from './addText.js';

function isOverflowing(size, columnWidth) {
  return size.width > columnWidth;
}

export default function getTruncatedLabel(
  doc,
  cursor,
  columnWidth,
  itemLabel,
  options = {},
) {
  const { fontSize } = options;

  let slicedSize = addText(doc, cursor, itemLabel, {
    fontSize,
    simulate: true,
  });
  let slicedText = itemLabel;

  while (isOverflowing(slicedSize, columnWidth)) {
    slicedText = `${slicedText.slice(0, -2)}…`;
    slicedSize = addText(doc, cursor, slicedText, {
      fontSize,
      simulate: true,
    });

    if (slicedText === '…') {
      break;
    }
  }
  return {
    label: slicedText,
    width: slicedSize.width,
    height: slicedSize.height,
  };
}
