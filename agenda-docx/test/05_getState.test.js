const AgendaFiles = require('../server/lib/agendaFiles');
const config = require('../config.dev');
const defaultState = require('../server/defaultState');
const service = require('..');

describe('functional - getState', () => {
  const { setJSON } = AgendaFiles({
    s3: config.s3,
    bucket: config.s3.bucket,
    uid: 'test04',
  });

  beforeAll(() => {
    service.init(config);
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
