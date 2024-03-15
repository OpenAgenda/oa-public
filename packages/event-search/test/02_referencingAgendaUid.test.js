'use strict';

const loadObjectFromFile = require('@openagenda/utils/loadObjectFromFile');

const load = loadObjectFromFile({ cwd: __dirname });

const config = require('../testconfig');

const Service = require('..');

describe('02 - event -search - functional: referencingAgendaUid Filter', () => {
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
    await service('referencingAgendaUid').rebuild({
      eventsList: async (_lastId, _limit) => load(
        'fixtures/02_events.referenceAgendaUid.json',
      ),
    });
  });

  it('filtering by referencingAgendaUid', async () => {
    const { events } = await service('referencingAgendaUid').search({
      referencingAgendaUid: 3,
    });
    expect(events.length).toBe(1);
    expect(events[0].uid).toBe(1);
  });
  it('filtering by notReferencingAgendaUid', async () => {
    const { events } = await service('referencingAgendaUid').search({
      notReferencingAgendaUid: 2,
    });
    expect(events.length).toBe(1);
    expect(events[0].uid).toBe(2);
  });
  it('filtering by multiple notReferencingAgendaUid', async () => {
    const { events } = await service('referencingAgendaUid').search({
      notReferencingAgendaUid: [2, 3],
    });
    expect(events.length).toBe(1);
  });
});
