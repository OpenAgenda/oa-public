"use strict";

const fs = require('fs');
const should = require('should');
const config = require('../testconfig');
const Service = require('../');

describe('06 - event search - functional: update', function() {
  let service;

  this.timeout(10000);

  before(async () => {
    service = Service(config);

    await service('test_index').rebuild({
      eventsList: async (lastId, limit) => JSON.parse(
        fs.readFileSync(`${__dirname}/fixtures/06_events.${lastId}.${limit}.json`)
      )
    });
  });

  it('udpate the title of an event', async () => {
    const result = await service('test_index').update({ uid: 1 }, {
      title: {
        fr: 'Look at me. I am the title now.'
      }
    }, {
      refresh: true
    });

    const {
      events,
      total
    } = await service('test_index').search({ uid: 1 });

    events[0].title.should.eql({
      fr: 'Look at me. I am the title now.'
    });
  });

  it('updating the title means change can be searched after update', async () => {
    const result = await service('test_index').update({ uid: 2 }, {
      title: {
        en: 'Witness me!'
      }
    }, { refresh: true });

    let { events, total } = await service('test_index').search({ search: 'Witness' });

    total.should.equal(1);

    events[0].title.should.eql({
      en: 'Witness me!',
      fr: 'Trié: Presque le plus dans le futur'
    });
  });

  it('if operation option is update (default) and document is not already indexed, error is thrown', async () => {
    try {
      await service('test_index').update({ uid: 12000 }, {
        title: 'I am a new document that is not yet in the index'
      });
    } catch (e) {
      e.message.should.equal('failed to update event 12000 to index of set test_index: document_missing_exception');
      return;
    }
    throw new Error('should have thrown an error');
  });

  it('if operation option is indexand document is not already indexed, it is added', async () => {
    const { success } = await service('test_index').update({ uid: 12001 }, {
      title: 'I am a new document that is not yet in the index'
    }, { operation: 'index' });
    
    success.should.equal(true);
  });
});
