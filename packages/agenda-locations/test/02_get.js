'use strict';

const _ = require('lodash');
const assert = require('assert');

const config = require('../testconfig');
const fixtures = require('./fixtures/load');
const Service = require('../');

describe('agenda-locations - functional - get', () => {
  const f = fixtures(config.mysql);

  let svc;

  before(async () => {
    await f.load();

    svc = Service({
      knex: f.client,
      imagePath: '//cibuldev.s3.amazonaws.com/',
      interfaces: {
        getAgendaIdByUid: async id => ({
          25221: 7196947
        })[id],
        getEventCounts: async (locationUids, { agendaUid }) => [{
          uid: 60763721,
          eventCount: 12,
          agendaEventCount: 8
        }, {
          uid: 51665985,
          eventCount: 9,
          agendaEventCount: 2
        }]
      }
    });
  });

  describe('defaults', () => {
    let location;

    before(async () => {
      location = await svc.get(51665985);
    });

    it('location is the result', () => {
      assert.equal(location.name, 'Grotte Chauvet 2 - Ardèche');
    });

    it('requested location is provided location', () => {
      assert.equal(location.uid, 51665985);
    });

    it('image is provided without path', () => {
      assert.equal(location.image.split('/').length, 1);
    });
  });

  describe('other', () => {

    it('uid can be provided within object', async () => {
      const location = await svc.get({ uid: 51665985 });

      assert.equal(location.name, 'Grotte Chauvet 2 - Ardèche');
    });

    it('uid can be provided as a string', async () => {
      const location = await svc.get('51665985');

      assert.equal(location.name, 'Grotte Chauvet 2 - Ardèche');
    });

    it('if getEventCounts interface is set and eventCount option is true, location includes interface-provided event counts', async () => {
      const location = await svc(7196947).get(60763721, { eventCounts: true });

      assert.equal(location.eventCount, 12);
      assert.equal(location.agendaEventCount, 8);
    });

    it('when includeImagePath is provided, image path is in image value', async () => {
      const {
        image
      } = await svc.get(51665985, { includeImagePath: true });

      assert.ok(image.split('/').length > 1);
    });

  });
});
