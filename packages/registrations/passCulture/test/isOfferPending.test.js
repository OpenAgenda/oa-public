import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import Registration from '../../index.js';
import eventGetResponse from './fixtures/eventGetResponse.json';

const pendingEventGetResponse = {
  ...eventGetResponse,
  status: 'PENDING',
  id: 28303,
};

describe('isOfferPending', () => {
  let server;
  let registration;
  beforeAll(async () => {
    registration = Registration({
      passCulture: {
        key: 'validAPIKey',
        api: 'https://pc.local',
      },
    });
  });

  beforeAll(() => {
    server = setupServer(
      http.get(
        'https://pc.local/public/offers/v1/events/:id',
        ({ params }) => HttpResponse.json(params.id === '28303' ? pendingEventGetResponse : eventGetResponse),
      ),
    );

    server.listen();
  });

  afterAll(() => {
    server.close();
  });

  test('returns true if offer is pending', async () => {
    expect(
      await registration({}).passCulture.isOfferPending({ passId: 28303 }),
    ).toBe(true);
  });

  test('returns false if offer is not pending', async () => {
    expect(
      await registration({}).passCulture.isOfferPending({ passId: 3829389 }),
    ).toBe(false);
  });
});
