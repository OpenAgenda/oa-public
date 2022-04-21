import sinon from 'sinon';
import OaSdk from '../../src';
import testconfig from '../../testconfig';
import getError from '../utils/getError';

describe('connection', () => {
  jest.setTimeout(10000);

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

  it('fail connection', async () => {
    const oa = new OaSdk();

    const error = await getError(() => oa.connect('inexistant'));

    expect(error.message).toBe('Request failed with status code 401');
    expect(error.response.status).toBe(401);
    expect(error.response.statusText).toBe('Unauthorized');
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

    clock.tick((oa.expiresIn * 1000) + 1);

    await oa.refreshToken();

    expect(spy.callCount).toBe(2);

    clock.restore();
  });
});
