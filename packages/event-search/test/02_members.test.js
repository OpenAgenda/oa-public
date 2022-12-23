'use strict';

const fs = require('fs');

const config = require('../testconfig');

const Service = require('..');

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
      eventsList: async (_lastId, _limit) => JSON.parse(
        fs.readFileSync(`${__dirname}/fixtures/02_events.members.json`),
      ),
    });
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
});
