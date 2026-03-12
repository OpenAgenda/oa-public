import sinon from 'sinon';
import { setupService } from './setup.js';

const { getService } = setupService();

describe('refresh', () => {
  const now = new Date(Math.round(Date.now() / 1000) * 1000);
  let clock;

  beforeAll(() => {
    clock = sinon.useFakeTimers({ now });
  });

  afterAll(() => {
    clock.restore();
  });

  it('refresh lastSignin', async () => {
    const user = await getService().refresh(
      17133001,
      {
        lastSignin: true,
      },
      {
        detailed: true,
      },
    );

    expect(user.lastSignin).toStrictEqual(now);
  });

  it('refresh lastInboxCheck', async () => {
    const user = await getService().refresh(
      17133001,
      {
        lastInboxCheck: true,
      },
      {
        detailed: true,
      },
    );

    expect(user.lastInboxCheck).toStrictEqual(now);
  });

  it('refresh lastNotified', async () => {
    const user = await getService().refresh(
      17133001,
      {
        lastNotified: true,
      },
      {
        detailed: true,
      },
    );

    expect(user.lastNotified).toStrictEqual(now);
  });
});
