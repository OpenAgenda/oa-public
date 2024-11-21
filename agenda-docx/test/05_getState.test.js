import AgendaFiles from '../server/lib/agendaFiles.js';
import config from '../config.dev.js';
import defaultState from '../server/defaultState.js';
import Service from '../server/index.js';

describe('functional - getState', () => {
  const { setJSON } = AgendaFiles({
    s3: config.s3,
    bucket: config.s3.bucket,
    uid: 'test04',
  });

  let service;

  beforeAll(() => {
    service = Service(config);
  });

  beforeAll(async () => {
    await setJSON('state.json', {
      what: 'a valid state',
    });
  });

  test('gets non default state', async () => {
    const state = await service.getState('test04');

    expect(state).toMatchObject({ what: 'a valid state' });
  });

  test('gets default state', async () => {
    const state = await service.getState('someotheruid');

    expect(state).toEqual(defaultState);
  });
});
