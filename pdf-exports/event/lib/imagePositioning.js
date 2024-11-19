import urlToBuffer from '../../utils/urlToBuffer.js';

export default async function imagePositioning(doc, cursor, options = {}) {
  const { content, width, simulate } = options;

  const imageWidth = Math.floor(width);
  const imageHeight = Math.floor(width / 1.5);

  const imageOptions = {
    fit: [imageWidth, imageHeight],
    align: 'left',
    valign: 'center',
  };

  let imageUrl;

  if (typeof content === 'string') {
    imageUrl = content;
  } else if (content?.filename) {
    const baseImageUrl = `https://img.openagenda.com/u/${imageWidth}x0/cibul/`;
    imageUrl = baseImageUrl + content.filename;
  }

  if (imageUrl) {
    const imageBuffer = await urlToBuffer(imageUrl);
    if (!simulate) {
      doc.image(imageBuffer, cursor.x, cursor.y, imageOptions);
    }
  }

  return {
    width: imageWidth,
    height: imageHeight,
  };
}
