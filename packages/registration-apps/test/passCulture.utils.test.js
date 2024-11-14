import {
  addPriceCategory,
  removePriceCategory,
  getNextId,
} from '../src/passCulture/utils.js';

describe('passCulture', () => {
  describe('utils', () => {
    describe('price categories', () => {
      test('add a price category to pc payload', () => {
        expect(
          addPriceCategory(
            {
              priceCategories: [],
            },
            0,
            {
              price: 2,
              label: 'Tarif réduit',
            },
          ),
        ).toEqual({
          priceCategories: [
            {
              id: 0,
              price: 200,
              label: 'Tarif réduit',
            },
          ],
        });
      });

      test('remove a price category from pc payload causes corresponding dates to be removed as well', () => {
        expect(
          removePriceCategory(
            {
              priceCategories: [
                {
                  id: 0,
                  price: 2,
                  label: 'Tarif réduit',
                },
                {
                  id: 1,
                  price: 250,
                  label: 'Tarif moins réduit',
                },
              ],
              dates: [
                {
                  id: 2,
                  timingId: 1699801200000,
                  priceCategoryId: 0,
                  quantity: 3,
                },
                {
                  id: 3,
                  timingId: 1699801200000,
                  priceCategoryId: 1,
                  quantity: 6,
                },
              ],
            },
            {
              id: 0,
              price: 2,
              label: 'Tarif réduit',
            },
          ),
        ).toEqual({
          priceCategories: [
            {
              id: 1,
              price: 250,
              label: 'Tarif moins réduit',
            },
          ],
          dates: [
            {
              id: 3,
              timingId: 1699801200000,
              priceCategoryId: 1,
              quantity: 6,
            },
          ],
        });
      });
    });

    describe('nextId', () => {
      test('get the current value of empty obj', () => {
        expect(getNextId({})).toEqual(0);
      });
      test('get the current value of null', () => {
        expect(
          getNextId({
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
                priceCategoryIndex: 0,
                priceCategoryId: 78979789798,
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
        ).toEqual(2);
      });
    });
  });
});
