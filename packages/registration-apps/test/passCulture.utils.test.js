import {
  addPriceCategory,
  removePriceCategory,
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
  });
});
