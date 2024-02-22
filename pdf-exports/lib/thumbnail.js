import urlToBuffer from './urlToBuffer.js';

export default async function thumbnail(event, __dirname) {
  const oaLogoPath = `${__dirname}/../images/oaLogo.png`;

  const imageWidth = 200;
  const imageHeight = 200;

  const thumbnailFilename = event.image?.variants.find(
    el => el.type === 'thumbnail',
  )?.filename;

  const newVersionThumbnail = thumbnailFilename?.includes('.thumb.image.jpg');

  let imageUrl;

  if (!thumbnailFilename && !newVersionThumbnail) {
    imageUrl = oaLogoPath;
  } else if (newVersionThumbnail) {
    const baseImageUrl = `https://img.openagenda.com/u/${imageWidth}x${imageHeight}/cibul/`;
    imageUrl = await urlToBuffer(
      baseImageUrl + event.image.filename,
      oaLogoPath,
    );
  } else {
    imageUrl = await urlToBuffer(event.image.base + thumbnailFilename);
  }

  return imageUrl;
}
