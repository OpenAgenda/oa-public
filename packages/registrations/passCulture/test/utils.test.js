import 'dotenv/config';
import { fileURLToPath } from 'node:url';
import isBase64 from 'is-base64';
import imageType from 'image-type';

import {
  processImage,
  extractSchemaOptions,
  getCurrentValue,
} from '../lib/utils.js';
import OpenAPIFixtures from './fixtures/openapi.json' with { type: 'json' };

const __dirname = fileURLToPath(new URL('.', import.meta.url));

async function isBase64Image(base64String) {
  if (!isBase64(base64String, { mimeRequired: false })) {
    return false;
  }

  const type = await imageType(Buffer.from(base64String, 'base64'));

  return type !== null && type.mime.startsWith('image/');
}

const { TEST_IMAGE_URL: testImageURL } = process.env;

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

      expect(await isBase64Image(base64Img)).toBe(true);
    });
  });

  describe('extractSchemaOptions', () => {
    test('related enums are either MusicTypeEnum or ShowTypeEnum', () => {
      const result = extractSchemaOptions(
        OpenAPIFixtures,
        'EventOfferCreation',
        'category',
        'categoryRelatedFields',
      );

      expect(
        result.reduce(
          (types, item) =>
            types.concat(item.related.filter((i) => !types.includes(i))),
          [],
        ),
      ).toEqual(['MusicTypeEnum', 'ShowTypeEnum']);
    });
  });

  describe('getCurrentValue', () => {
    test('get the current value of empty obj', () => {
      expect(getCurrentValue({})).toEqual({});
    });
    test('get the current value of null', () => {
      expect(getCurrentValue(null)).toEqual({});
    });
    test('get the current value of stored Obj', () => {
      expect(
        getCurrentValue({
          venueId: 548,
          category: 'CONCERT',
          musicType: 'JAZZ-BEBOP',
          priceCategories: [
            {
              id: 0,
              price: '123',
              label: 'trezterztrez',
            },
          ],
          dates: [
            {
              id: 1,
              timingId: 1700904600000,
              priceCategoryId: 0,
              quantity: '456',
            },
          ],
          bookingContact: 'gdfsgfdsgdfs@gfsgfsd.com',
          appliedAt: '2024-04-15T10:39:00+0200',
          response: {
            id: 797878989,
            priceCategories: [
              {
                id: 0,
                passId: 78979789798,
              },
            ],
            dates: [
              {
                id: 1,
                passId: 89564654,
              },
            ],
          },
        }),
      ).toStrictEqual({
        venueId: 548,
        category: 'CONCERT',
        musicType: 'JAZZ-BEBOP',
        priceCategories: [
          { price: '123', label: 'trezterztrez', passId: 78979789798, id: 0 },
        ],
        dates: [
          {
            timingId: 1700904600000,
            priceCategoryId: 0,
            quantity: '456',
            passId: 89564654,
            id: 1,
          },
        ],
        bookingContact: 'gdfsgfdsgdfs@gfsgfsd.com',
        appliedAt: '2024-04-15T10:39:00+0200',
        id: 797878989,
      });
    });

    test('get the current value of stored Obj with patchedValues', () => {
      const initialValue = [
        {
          venueId: 548,
          category: 'CONCERT',
          musicType: 'JAZZ-BEBOP',
          priceCategories: [
            {
              id: 0,
              price: '123',
              label: 'trezterztrez',
            },
            {
              id: 1,
              price: '724',
              label: 'static',
            },
          ],
          dates: [
            {
              id: 2,
              timingId: 1700904600000,
              priceCategoryId: 0,
              quantity: '456',
            },
          ],
          bookingContact: 'gdfsgfdsgdfs@gfsgfsd.com',
          appliedAt: '2024-04-15T10:39:00+0200',
          response: {
            id: 797878989,
            priceCategories: [
              {
                id: 0,
                passId: 78979789798,
              },
              {
                id: 1,
                passId: 9845798,
              },
            ],
            dates: [
              {
                id: 2,
                passId: 89564654,
              },
            ],
          },
        },
      ];
      expect(
        getCurrentValue(
          initialValue.concat({
            priceCategories: [
              {
                price: '456',
                label: 'updated',
                passId: 78979789798,
                id: 0,
              },
              {
                id: 3,
                price: '2',
                label: 'new',
              },
            ],
          }),
        ),
      ).toStrictEqual({
        venueId: 548,
        category: 'CONCERT',
        musicType: 'JAZZ-BEBOP',
        priceCategories: [
          { price: '456', label: 'updated', passId: 78979789798, id: 0 },
          { price: '724', label: 'static', passId: 9845798, id: 1 },
          { label: 'new', price: '2', id: 3 },
        ],
        dates: [
          {
            id: 2,
            timingId: 1700904600000,
            priceCategoryId: 0,
            quantity: '456',
            passId: 89564654,
          },
        ],
        bookingContact: 'gdfsgfdsgdfs@gfsgfsd.com',
        appliedAt: '2024-04-15T10:39:00+0200',
        id: 797878989,
      });
      expect(initialValue[0].priceCategories).toEqual([
        {
          id: 0,
          price: '123',
          label: 'trezterztrez',
        },
        {
          id: 1,
          price: '724',
          label: 'static',
        },
      ]);
    });
    test('get the current value with error', () => {
      const initialValue = [
        {
          eventDuration: 90,
          bookingContact: 'clem@oa.com',
          response: {
            passId: 73696,
            isPending: false,
          },
          venueId: 548,
          category: 'ATELIER_PRATIQUE_ART',
          operation: 'create',
          appliedAt: '2024-07-16T10:57:14.056Z',
          duo: true,
        },
        {
          priceCategories: [
            {
              price: 3000,
              label: 'Tarif unique',
              id: 0,
            },
          ],
          error: {
            code: 400,
            name: 'BadRequest',
            shortMessage: 'priceCategories create',
            className: 'bad-request',
            message: 'priceCategories create',
            info: {
              'priceCategories.0.price': [
                'ensure this value is less than or equal to 30000',
              ],
            },
            statusCode: 400,
          },
        },
      ];
      expect(getCurrentValue(initialValue)).toStrictEqual({
        bookingContact: 'clem@oa.com',
        appliedAt: '2024-07-16T10:57:14.056Z',
        category: 'ATELIER_PRATIQUE_ART',
        duo: true,
        eventDuration: 90,
        isPending: false,
        passId: 73696,
        venueId: 548,
        operation: 'create',
        priceCategories: [
          {
            price: 3000,
            label: 'Tarif unique',
            id: 0,
          },
        ],
        error: {
          code: 400,
          name: 'BadRequest',
          shortMessage: 'priceCategories create',
          className: 'bad-request',
          message: 'priceCategories create',
          info: {
            'priceCategories.0.price': [
              'ensure this value is less than or equal to 30000',
            ],
          },
          statusCode: 400,
        },
      });
    });
  });
});
