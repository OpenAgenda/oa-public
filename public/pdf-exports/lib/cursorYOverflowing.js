export default function cursorYOverflowing(doc, localCursorY) {
  const marginsY = doc.page.margins.top + doc.page.margins.bottom;

  const ratio = localCursorY / (doc.page.height - marginsY);

  return Math.floor(ratio) > 0;
}
