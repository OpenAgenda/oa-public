import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import urlToBuffer from '../../utils/urlToBuffer.js';

const OALogoPath = `${dirname(fileURLToPath(import.meta.url))}/../../images/oaLogo.png`;

export default async function thumbnail(event, options = {}) {
  const { defaultImagePath = OALogoPath } = options;

  const size = 200;
  const thumb = event.image.variants.find((el) => el.type === 'thumbnail');

  return thumb
    ? urlToBuffer(
      `https://img.openagenda.com/u/${size}x${size}/${thumb.filename?.includes('.thumb.image.jpg') ? '' : 'smart/'}cibul/${thumb.filename}`,
      defaultImagePath,
    )
    : defaultImagePath;
}
