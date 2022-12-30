'use strict';

const fs = require('fs');

const config = require('../testconfig');
const Service = require('..');

describe('06 - event search - functional: update', () => {
  let service;

  beforeAll(async () => {
    service = Service(config);

    await service('test_index').rebuild({
      eventsList: async (lastId, limit) => JSON.parse(
        fs.readFileSync(`${__dirname}/fixtures/06_events.${lastId}.${limit}.json`),
      ),
    });
  });

  it('udpate the title of an event', async () => {
    await service('test_index').update({ uid: 1 }, {
      title: {
        fr: 'Look at me. I am the title now.',
      },
    }, {
      refresh: true,
    });

    const {
      events,
    } = await service('test_index').search({ uid: 1 });

    expect(events[0].title).toEqual({
      fr: 'Look at me. I am the title now.',
    });
  });

  it(
    'updating the title means change can be searched after update',
    async () => {
      await service('test_index').update({ uid: 2 }, {
        title: {
          en: 'Witness me!',
        },
      }, { refresh: true });

      const { events, total } = await service('test_index').search({ search: 'Witness' });

      expect(total).toBe(1);

      expect(events[0].title).toEqual({
        en: 'Witness me!',
        fr: 'Trié: Presque le plus dans le futur',
      });
    },
  );

  it(
    'if operation option is update (default) and document is not already indexed, error is thrown',
    async () => {
      let error;
      try {
        await service('test_index').update({ uid: 12000 }, {
          title: 'I am a new document that is not yet in the index',
        });
      } catch (e) {
        error = e;
      }
      expect(error.name).toBe('NotFound');
    },
  );

  it(
    'if operation option is indexand document is not already indexed, it is added',
    async () => {
      const { success } = await service('test_index').update({ uid: 12001 }, {
        title: 'I am a new document that is not yet in the index',
      }, { operation: 'index' });

      expect(success).toBe(true);
    },
  );

  it('if no data is provided, BadRequest is thrown', async () => {
    let error;
    try {
      await service('test_index').update({ uid: 12001 }, null);
    } catch (e) {
      error = e;
    }
    expect(error.name).toBe('BadRequest');
  });
});
