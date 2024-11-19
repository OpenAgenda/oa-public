import urlToBuffer from './urlToBuffer.js';

export default async function addAgendaLogo(
  doc,
  image,
  cursor,
  logoHeightAndWidth,
) {
  doc
    .circle(
      cursor.x + logoHeightAndWidth / 2,
      cursor.y + logoHeightAndWidth / 2,
      logoHeightAndWidth / 2,
    )
    .save()
    .clip()
    .image(await urlToBuffer(image), cursor.x, cursor.y, {
      width: logoHeightAndWidth,
      height: logoHeightAndWidth,
    })
    .restore();

  return {
    width: logoHeightAndWidth,
    height: logoHeightAndWidth,
  };
}
