import ky from 'ky';
import sharp from 'sharp';
import logs from '@openagenda/logs';

const log = logs('thumbnail');

const SIZE = 200;

// The event's picture as a square JPEG, or null when there is none or it
// cannot be fetched: an item then simply has no picture. Re-encoding keeps
// the file small and turns the formats Word cannot show (WebP) into JPEG. No
// retry: a missing picture is fine, a stalled download is not.
export default async function thumbnail(event, { timeout = 10000 } = {}) {
  const thumb = event.image?.variants?.find((v) => v.type === 'thumbnail');

  if (!thumb?.filename) return null;

  const crop = thumb.filename.includes('.thumb.image.jpg') ? '' : 'smart/';
  const url = `https://img.openagenda.com/u/${SIZE}x${SIZE}/${crop}cibul/${thumb.filename}`;

  try {
    const source = Buffer.from(
      await ky.get(url, { timeout, retry: 0 }).arrayBuffer(),
    );

    return await sharp(source)
      .resize(SIZE, SIZE, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toBuffer();
  } catch (error) {
    log.warn('could not fetch the event picture', {
      url,
      error: error.message,
    });

    return null;
  }
}
