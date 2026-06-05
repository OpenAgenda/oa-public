import Service from '../index.js';
import config from '../testconfig.js';

describe('02 - event search - functional: location', () => {
  let service;

  beforeAll(async () => {
    service = Service(config);

    try {
      await service.getConfig().client.indices.delete({
        index: 'test',
      });
    } catch (e) {
      // console.log(e);
    }
  });

  beforeAll(async () => {
    await service('members').rebuild({
      eventsList: async (_lastId, _limit) =>
        (await import('./fixtures/02_events.members.json', { type: 'json' }))
          .default,
    });
  });

  afterAll(async () => {
    await service('members').clear();
  });

  it('when member name is not available, user name is indexed', async () => {
    const {
      events: [event],
    } = await service('members').search({ uid: 2 }, {}, { detailed: true });

    expect(event.member.name).toBe('Berbouche');
  });

  it('if custom data is provided at first level of member data, it is included in document', async () => {
    const {
      events: [event],
    } = await service('members').search({ uid: 1 }, {}, { detailed: true });

    expect(event.member.customField).toBe('Ladida');
  });

  it('admin search finds an event by its organizing structure name (Emmaüs)', async () => {
    const { total, events } = await service('members').search(
      { search: 'emmaus' },
      {},
      { access: 'administrator' },
    );

    expect(total).toBe(1);
    expect(events[0].uid).toBe(3);
  });

  it('public search does NOT find an event by member structure (GDPR)', async () => {
    const { total } = await service('members').search(
      { search: 'emmaus' },
      {},
      { access: 'public' },
    );

    expect(total).toBe(0);
  });

  it('the admin-only member search field is never returned in results', async () => {
    const {
      events: [event],
    } = await service('members').search(
      { search: 'emmaus' },
      {},
      { access: 'administrator', detailed: true },
    );

    expect(event._admin_search_member).toBeUndefined();
    expect(event._admin_search_member_filtered).toBeUndefined();
  });
});
