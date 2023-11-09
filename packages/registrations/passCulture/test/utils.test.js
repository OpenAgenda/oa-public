import 'dotenv/config';
import { fileURLToPath } from 'node:url';
import isBase64 from 'is-base64';
import imageType from 'image-type';

import { processImage } from '../lib/utils';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

async function isBase64Image(base64String) {
  if (!isBase64(base64String, { mimeRequired: false })) {
    return false;
  }

  const type = await imageType(
    Buffer.from(base64String, 'base64'),
  );

  return type !== null && type.mime.startsWith('image/');
}

const {
  TEST_IMAGE_URL: testImageURL,
} = process.env;

describe('utils', () => {
  describe('processImage', () => {
    test('downloads and transforms image from given remote URL', async () => {
      const base64Img = await processImage({
        url: testImageURL,
      });

      expect(await isBase64Image(base64Img)).toBe(true);
    });

    test('loads and transforms image from file', async () => {
      const base64Img = await processImage({
        path: `${__dirname}fixtures/image.jpg`,
      });

      expect(
        await isBase64Image(base64Img),
      ).toBe(true);
    });
  });
});
