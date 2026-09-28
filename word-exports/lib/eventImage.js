import ky from 'ky';
import sharp from 'sharp';
import QRCode from 'qrcode';
import logs from '@openagenda/logs';

const log = logs('eventImage');

const MAX_WIDTH = 1600;

// A render always reads from the production bucket: a dev run has no objects of
// its own. Anchored on the `/dev/` segment, never a bare `dev`, which would hit
// a filename first (see pdf-exports/utils/urlToBuffer.js).
const fromProductionBucket = (url) => url.replace('/dev/', '/main/');

// The URL of the event's picture, in its largest variant. The value is an
// image object, or a string (a URL, or a filename under `imagePath`), as the
// PDF reads it too.
export function eventImageUrl(image, imagePath) {
  if (typeof image === 'string') {
    if (/^https?:/.test(image)) return image;

    return imagePath ? `${imagePath.replace(/\/?$/, '/')}${image}` : null;
  }

  if (!image?.filename) return null;

  const full = image.variants?.find((v) => v.type === 'full');
  const filename = full?.filename ?? image.filename;
  const base = image.base ?? imagePath;

  if (/^https?:/.test(filename)) return filename;

  return base ? `${base.replace(/\/?$/, '/')}${filename}` : null;
}

// The event's main picture as a JPEG and its size in pixels, or null when it
// cannot be fetched: the document then goes without.
export async function fetchEventImage(
  image,
  { imagePath, timeout = 15000 } = {},
) {
  const url = eventImageUrl(image, imagePath);

  if (!url) return null;

  try {
    const source = Buffer.from(
      await ky
        .get(fromProductionBucket(url), { timeout, retry: 0 })
        .arrayBuffer(),
    );
    const { data, info } = await sharp(source)
      .rotate()
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .jpeg({ quality: 82 })
      .toBuffer({ resolveWithObject: true });

    return { buffer: data, width: info.width, height: info.height };
  } catch (error) {
    log.warn('could not fetch the event picture', {
      url,
      error: error.message,
    });

    return null;
  }
}

export function qrCode(url) {
  return QRCode.toBuffer(url, { type: 'png', width: 300, margin: 1 });
}
