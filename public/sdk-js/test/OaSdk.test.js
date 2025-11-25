import sinon from 'sinon';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { OaSdk } from '../src/index.js';
import testconfig from '../testconfig.js';

const handlers = [
  http.post('*/requestAccessToken', () =>
    HttpResponse.json({
      access_token: '4fcf5c0a3e38c9ed9da5818ffdf4f1a7',
      expires_in: 3600,
    })),

  http.all('*', () => new HttpResponse(null, { status: 500 })),
];

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('connection', () => {
  it('simple connect', async () => {
    const oa = new OaSdk({ secretKey: testconfig.secretKey });

    await oa.connect();

    expect(oa.accessToken).toHaveLength(32);
  });

  it('simple connect - key provided on connect', async () => {
    const oa = new OaSdk();

    await oa.connect(testconfig.secretKey);

    expect(oa.accessToken).toHaveLength(32);
  });
});

describe('refresh expired token', () => {
  it('refresh token if needed', async () => {
    const oa = new OaSdk();

    const spy = sinon.spy(oa, 'connect');

    await oa.connect(testconfig.secretKey);

    const clock = sinon.useFakeTimers(Date.now());

    // Do nothing
    await oa.refreshToken();

    expect(spy.callCount).toBe(1);

    clock.tick(oa.expiresIn * 1000 + 1);

    await oa.refreshToken();

    expect(spy.callCount).toBe(2);

    clock.restore();
  });
});
