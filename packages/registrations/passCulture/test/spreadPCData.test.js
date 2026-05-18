import spreadPCData from '../iso/spreadPCData.js';
import { getObjectType } from '../iso/utils.js';
import unnapplied from './fixtures/data.unnapplied.pc.json' with { type: 'json' };
import partiallyApplied from './fixtures/data.withUpdate.pc.json' with { type: 'json' };
import withPriceCategoryUpdate from './fixtures/data.withPriceCategoryUpdate.pc.json' with { type: 'json' };

describe('spreadPCData', () => {
  test('data is spread according to single item single API call principle', () => {
    expect(unnapplied.length).toBe(2);

    expect(spreadPCData(unnapplied).length).toBe(4);
  });

  test('items which contain mixed updates and creates are spread', () => {
    const spread = spreadPCData(partiallyApplied);

    expect(spread[3]).toEqual({
      priceCategories: [
        {
          id: 0,
          price: 457,
          label: 'updated',
        },
      ],
    });

    expect(spread[4]).toEqual({
      priceCategories: [
        {
          id: 3,
          price: 78,
          label: 'new pricing',
        },
      ],
    });
  });

  test('when already applied, first item keeps its appliedAt and response keys', () => {
    const spread = spreadPCData(withPriceCategoryUpdate);

    expect(Object.keys(spread[0])).toEqual([
      'duo',
      'venueId',
      'category',
      'musicType',
      'bookingContact',
      'response',
      'appliedAt',
    ]);
  });

  test('first item is an event offer', () => {
    const spread = spreadPCData([
      {
        editing: true,
        priceCategories: [
          {
            label: 'Tarif unique',
            price: 0,
            id: 0,
          },
        ],
        duo: true,
        venueId: 548,
        category: 'CONCERT',
        musicType: 'JAZZ-BEBOP',
        dates: [
          {
            id: 1,
            timingId: 1718442000000,
            priceCategoryId: 0,
            quantity: '456',
          },
        ],
        eventDuration: 150,
      },
    ]);

    expect(getObjectType(spread[0])).toBe('eventOffer');
  });

  test('second item can be a no longer pending event offer', () => {
    const spread = spreadPCData([
      {
        duo: true,
        venueId: 548,
        category: 'CONCERT',
        musicType: 'JAZZ-BEBOP',
        bookingContact: 'gdfsgfdsgdfs@gfsgfsd.com',
        appliedAt: '2024-05-29T10:00:00.OOOZ',
        response: {
          passId: 123456,
          isPending: true,
        },
        operation: 'create',
      },
      {
        appliedAt: '2024-05-29T11:00:00.OOOZ',
        response: {
          isPending: false,
        },
        operation: 'get',
      },
    ]);

    expect(spread[1].operation).toBe('get');
  });

  test('spread clear editing if alone', () => {
    const spread = spreadPCData([
      {
        eventDuration: 120,
        bookingContact: 'clement.lecroart@openagenda.com',
        response: { passId: 73327, isPending: false },
        venueId: 548,
        category: 'CINE_PLEIN_AIR',
        operation: 'create',
        appliedAt: '2024-06-24T14:51:43.648Z',
        duo: true,
      },
      {
        priceCategories: [{ price: 0, label: 'Tarif unique', id: 0 }],
        response: { priceCategories: [{ passId: 4868, id: 0 }] },
        operation: 'create',
        appliedAt: '2024-06-24T14:51:44.172Z',
      },
      {
        response: {
          dates: [
            { passId: 94950, id: 1 },
            { passId: 94951, id: 2 },
          ],
        },
        dates: [
          { quantity: 1, priceCategoryId: 0, timingId: 1719563400000, id: 1 },
          { quantity: 2, priceCategoryId: 0, timingId: 1719648000000, id: 2 },
        ],
        operation: 'create',
        appliedAt: '2024-06-24T14:51:44.685Z',
      },
      {
        editing: true,
        dates: [
          { timingId: 1719563400000, priceCategoryId: 0, quantity: '2', id: 1 },
        ],
      },
    ]);

    expect(spread.filter((s) => s.editing === true).length).toBe(0);
  });

  test('spread keeps editing neighbour if exist', () => {
    const spread = spreadPCData([
      {
        eventDuration: 120,
        bookingContact: 'clement.lecroart@openagenda.com',
        response: { passId: 73327, isPending: false },
        venueId: 548,
        category: 'CINE_PLEIN_AIR',
        operation: 'create',
        appliedAt: '2024-06-24T14:51:43.648Z',
        duo: true,
      },
      {
        priceCategories: [{ price: 0, label: 'Tarif unique', id: 0 }],
        response: { priceCategories: [{ passId: 4868, id: 0 }] },
        operation: 'create',
        appliedAt: '2024-06-24T14:51:44.172Z',
      },
      {
        response: {
          dates: [
            { passId: 94950, id: 1 },
            { passId: 94951, id: 2 },
          ],
        },
        dates: [
          { quantity: 1, priceCategoryId: 0, timingId: 1719563400000, id: 1 },
          { quantity: 2, priceCategoryId: 0, timingId: 1719648000000, id: 2 },
        ],
        operation: 'create',
        appliedAt: '2024-06-24T14:51:44.685Z',
      },
      {
        editing: true,
        eventDuration: 210,
        dates: [
          { timingId: 1719563400000, priceCategoryId: 0, quantity: '2', id: 1 },
        ],
      },
    ]);

    expect(spread[3]).toStrictEqual({ eventDuration: 210 });
  });

  test('deletion is handled in spread', () => {
    const spread = spreadPCData([
      {
        eventDuration: 120,
        bookingContact: 'clement.lecroart@openagenda.com',
        response: { passId: 73327, isPending: false },
        venueId: 548,
        category: 'CINE_PLEIN_AIR',
        operation: 'create',
        appliedAt: '2024-06-24T14:51:43.648Z',
        duo: true,
      },
      {
        priceCategories: [{ price: 0, label: 'Tarif unique', id: 0 }],
        response: { priceCategories: [{ passId: 4868, id: 0 }] },
        operation: 'create',
        appliedAt: '2024-06-24T14:51:44.172Z',
      },
      {
        response: {
          dates: [
            { passId: 94950, id: 1 },
            { passId: 94951, id: 2 },
          ],
        },
        dates: [
          {
            quantity: 1,
            priceCategoryId: 0,
            timingId: 1719563400000,
            id: 1,
          },
          {
            quantity: 2,
            priceCategoryId: 0,
            timingId: 1719648000000,
            id: 2,
          },
        ],
        operation: 'create',
        appliedAt: '2024-06-24T14:51:44.685Z',
      },
      {
        dates: [
          {
            id: 2,
            deleted: true,
          },
          {
            id: 1,
            quantity: 10,
          },
        ],
      },
    ]);

    expect(spread[3]).toEqual({
      dates: [
        {
          id: 1,
          quantity: 10,
        },
      ],
    });

    expect(spread[4]).toEqual({
      dates: [
        {
          id: 2,
          deleted: true,
        },
      ],
    });
  });
});
