import {
  addPriceCategory,
  removePriceCategory,
  getCurrentValue,
  getNextId,
} from '../src/passCulture/utils';

describe('passCulture', () => {
  describe('utils', () => {
    describe('price categories', () => {
      test('add a price category to pc payload', () => {
        expect(
          addPriceCategory({
            priceCategories: [],
          }, {
            price: 2,
            label: 'Tarif réduit',
          }),
        ).toEqual({
          priceCategories: [{
            price: 2,
            label: 'Tarif réduit',
          }],
        });
      });

      test('remove a price category from pc payload causes corresponding dates to be removed as well', () => {
        expect(
          removePriceCategory({
            priceCategories: [{
              price: 2,
              label: 'Tarif réduit',
            },
            {
              price: 250,
              label: 'Tarif moins réduit',
            }],
            dates: [{
              timingId: 1699801200000,
              priceCategoryIndex: 0,
              quantity: 3,
            }, {
              timingId: 1699801200000,
              priceCategoryIndex: 1,
              quantity: 6,
            }],
          }, {
            price: 2,
            label: 'Tarif réduit',
          }),
        ).toEqual({
          priceCategories: [{
            price: 250,
            label: 'Tarif moins réduit',
          }],
          dates: [{
            timingId: 1699801200000,
            priceCategoryIndex: 1,
            quantity: 6,
          }],
        });
      });
    });
    describe('getCurrentValue', () => {
      test('get the current value of empty obj', () => {
        expect(
          getCurrentValue({}),
        ).toEqual({});
      });
      test('get the current value of null', () => {
        expect(
          getCurrentValue(null),
        ).toEqual({});
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
                priceCategoryIndex: 0,
                priceCategoryId: 78979789798,
                quantity: '456',
              },
            ],
            bookingContact: 'gdfsgfdsgdfs@gfsgfsd.com',
            appliedAt: '2024-04-15T10:39:00+0200',
            response: {
              id: 797878989,
              priceCategories: [{
                id: 0,
                passId: 78979789798,
              }],
              dates: [{
                id: 1,
                passId: 89564654,
              }],
            },
          }),
        ).toStrictEqual({
          venueId: 548,
          category: 'CONCERT',
          musicType: 'JAZZ-BEBOP',
          priceCategories: [{ price: '123', label: 'trezterztrez', passId: 78979789798, id: 0 }],
          dates: [
            {
              timingId: 1700904600000,
              priceCategoryIndex: 0,
              priceCategoryId: 78979789798,
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
        const initialValue = [{
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
              priceCategoryIndex: 0,
              priceCategoryId: 78979789798,
              quantity: '456',
            },
          ],
          bookingContact: 'gdfsgfdsgdfs@gfsgfsd.com',
          appliedAt: '2024-04-15T10:39:00+0200',
          response: {
            id: 797878989,
            priceCategories: [{
              id: 0,
              passId: 78979789798,
            }, { id: 1, passId: 9845798 }],
            dates: [{
              id: 2,
              passId: 89564654,
            }],
          },
        }];
        expect(
          getCurrentValue(initialValue.concat({
            priceCategories: [
              {
                price: '456',
                label: 'updated',
                passId: 78979789798,
                id: 0,
              }, {
                id: 3,
                price: '2',
                label: 'new',
              },
            ],
          })),
        ).toStrictEqual({
          venueId: 548,
          category: 'CONCERT',
          musicType: 'JAZZ-BEBOP',
          priceCategories: [
            { price: '456', label: 'updated', passId: 78979789798, id: 0 },
            { price: '724', label: 'static', passId: 9845798, id: 1 },
            { label: 'new', price: '2', id: 3 }],
          dates: [
            {
              id: 2,
              timingId: 1700904600000,
              priceCategoryIndex: 0,
              priceCategoryId: 78979789798,
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
    });

    describe.only('nextId', () => {
      test('get the current value of empty obj', () => {
        expect(
          getNextId({}),
        ).toEqual(0);
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
              priceCategories: [{
                id: 0,
                passId: 78979789798,
              }],
              dates: [{
                id: 1,
                passId: 89564654,
              }],
            },
          }),
        ).toEqual(2);
      });
    });
  });
});
