export default function addIcon(
  doc,
  image,
  cursor,
  iconHeightAndWidth,
  options = {},
) {
  const { simulate = false } = options;

  if (!simulate) {
    doc.image(image, cursor.x, cursor.y, {
      align: 'center',
      valign: 'center',
      height: iconHeightAndWidth,
    });
  }

  return {
    width: iconHeightAndWidth,
    height: iconHeightAndWidth,
  };
}
