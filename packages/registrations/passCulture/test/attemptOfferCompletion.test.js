import 'dotenv/config';
import createEventOffer from '../createEventOffer.js';
import attemptOfferCompletion from '../attemptOfferCompletion.js';

import PassCultureSDK from '../lib/PassCultureSDK.js';

const { PASS_API_KEY: key, PASS_API_DOMAIN: api } = process.env;

if (!key) {
  throw new Error('PASS_API_KEY env var must be defined');
}

describe('attemptOfferCompletion', () => {
  let pc;
  let eventOffer;
  let datesPayload;

  beforeAll(async () => {
    pc = PassCultureSDK({ api, key });

    const createEventOfferResp = await createEventOffer(
      pc,
      {
        title: { fr: 'DHM' },
        timings: [
          {
            begin: { date: '2033-11-12', hours: 9, minutes: 30 },
            end: { date: '2033-11-12', hours: 12, minutes: 0 },
          },
        ],
      },
      {
        priceCategories: [
          {
            price: 78,
            label: 'Pouik',
            id: 0,
          },
        ],
        dates: [
          {
            priceCategoryId: 0,
            quantity: 789,
            timingId: 2015397000000,
          },
        ],
        venueId: 548,
        category: 'EVENEMENT_JEU',
      },
      {
        simulatePending: true,
      },
    );
    eventOffer = createEventOfferResp.eventOffer;
    datesPayload = createEventOfferResp.datesPayload;
  });

  it('CompleteIncompleteOffer', async () => {
    const res2 = await attemptOfferCompletion(
      { pc },
      { eventOfferId: eventOffer.id, datesPayload },
      { eventUid: 1, agendaUid: 2 },
      { simulatePending: false },
    );
    expect(res2).toBe(true);
  });

  it('completion of the offer will call OaPatchEvent to update registration', async () =>
    new Promise((rs) => {
      attemptOfferCompletion(
        {
          pc,
          interfaces: {
            patchOaEventRegistration: (agendaUid, eventUid, dates) => {
              expect(eventUid).toBe(1);
              expect(agendaUid).toBe(2);
              expect(dates).toBeInstanceOf(Array);
              rs();
              return true;
            },
          },
        },
        { eventOfferId: eventOffer.id, datesPayload: [] },
        { eventUid: 1, agendaUid: 2 },
        { simulatePending: false },
      );
    }));
  it('Inactive offer is still updated', async () => {
    const res = await attemptOfferCompletion(
      { pc },
      { eventOfferId: eventOffer.id, datesPayload: [] },
      { eventUid: null, agendaUid: null },
      { simulatePending: false },
    );
    expect(res).toBe(true);
  });
  it('Pending offer is overlooked', async () => {
    const res = await attemptOfferCompletion(
      { pc },
      { eventOfferId: eventOffer.id, datesPayload: [] },
      { eventUid: null, agendaUid: null },
      { simulatePending: true },
    );
    expect(res).toBe(false);
  });
});
