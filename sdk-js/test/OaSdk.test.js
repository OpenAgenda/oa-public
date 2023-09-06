import sinon from 'sinon';
import MockAdapter from '@openagenda/axios-mock-adapter';
import { OaSdk } from '../src';
import testconfig from '../testconfig';

function mockAuth(api) {
  const mock = new MockAdapter(api);

  mock
    .onPost('/requestAccessToken')
    .reply(200, {
      access_token: '4fcf5c0a3e38c9ed9da5818ffdf4f1a7',
      expires_in: 3600,
    })
    .onAny()
    .reply(500);

  return mock;
}

describe('connection', () => {
  it('simple connect', async () => {
    const oa = new OaSdk({ secretKey: testconfig.secretKey });

    mockAuth(oa.api);

    await oa.connect();

    expect(oa.accessToken).toHaveLength(32);
  });

  it('simple connect - key provided on connect', async () => {
    const oa = new OaSdk();

    mockAuth(oa.api);

    await oa.connect(testconfig.secretKey);

    expect(oa.accessToken).toHaveLength(32);
  });
});

describe('refresh expired token', () => {
  it('refresh token if needed', async () => {
    const oa = new OaSdk();

    mockAuth(oa.api);

    const spy = sinon.spy(oa, 'connect');

    await oa.connect(testconfig.secretKey);

    const clock = sinon.useFakeTimers(Date.now());

    // Do nothing
    await oa.refreshToken();

    expect(spy.callCount).toBe(1);

    clock.tick((oa.expiresIn * 1000) + 1);

    await oa.refreshToken();

    expect(spy.callCount).toBe(2);

    clock.restore();
  });
});
