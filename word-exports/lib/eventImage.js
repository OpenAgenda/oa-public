import ky from 'ky';
import sharp from 'sharp';
import QRCode from 'qrcode';
import logs from '@openagenda/logs';

const log = logs('eventImage');

// Pictures are embedded at 150 dpi of their display size: sharp in print, and
// no heavier than that.
export const PRINT_DPI = 150;
const DEFAULT_MAX_WIDTH = 1600;

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

// A picture as the document embeds it: upright, at most `maxWidth` pixels
// wide, as JPEG, and its size in pixels.
export async function toDocumentJpeg(
  source,
  { maxWidth = DEFAULT_MAX_WIDTH } = {},
) {
  const { data, info } = await sharp(source)
    .rotate()
    .resize({ width: maxWidth, withoutEnlargement: true })
    // JPEG has no transparency: a transparent background would turn black.
    .flatten({ background: '#ffffff' })
    .jpeg({ quality: 82 })
    .toBuffer({ resolveWithObject: true });

  return { buffer: data, width: info.width, height: info.height };
}

// The event's main picture as a JPEG and its size in pixels, or null when it
// cannot be fetched: the document then goes without.
export async function fetchEventImage(
  image,
  { imagePath, maxWidth, timeout = 15000 } = {},
) {
  const url = eventImageUrl(image, imagePath);

  if (!url) return null;

  try {
    const source = Buffer.from(
      await ky
        .get(fromProductionBucket(url), { timeout, retry: 0 })
        .arrayBuffer(),
    );
    return await toDocumentJpeg(source, { maxWidth });
  } catch (error) {
    log.warn('could not fetch the event picture', {
      url,
      error: error.message,
    });

    return null;
  }
}

export const QR_PIXELS = 300;

export function qrCode(url) {
  return QRCode.toBuffer(url, { type: 'png', width: QR_PIXELS, margin: 1 });
}
