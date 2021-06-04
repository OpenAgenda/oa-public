'use strict';

const assert = require('assert');
const _ = require('lodash');

const Files = require('@openagenda/files');

const {
  service: config,
  dependencies: dConfig,
} = require('../testconfig.sample');

const fixtures = require('./fixtures');
const Service = require('..');

describe('agenda-locations - functional - get', function () {
  this.timeout(10000);

  const f = fixtures(config.mysql);

  let svc;

  before(async () => {
    await f.load();

    svc = Service({
      knex: f.client,
      Files: Files(dConfig.files),
      imagePath: '//cibuldev.s3.amazonaws.com/',
      interfaces: {
        getAgendaDetailsByUid: async (uid, fields = []) => _.pick(
          {
            id: {
              7196947: 25221,
            }[uid],
            locationSetUid: {
              7196947: 1903810,
            }[uid],
          },
          fields
        ),
        getEventCounts: async (locationUids, { agendaUid }) => [
          {
            uid: 60763721,
            eventCount: 12,
            agendaEventCount: 8,
          },
          {
            uid: 51665985,
            eventCount: 9,
            agendaEventCount: 2,
          },
        ],
        getLinkedAgendas :  async (locationUid) => [
          {
            uid: 100000,
            title: 'BLABLA'
          },
          {
            uid: 200000,
            title: 'BLIBLI'
          }
        ]
      },
    });
  });

  describe('defaults', () => {
    let location;

    before(async () => {
      location = await svc.get(51665987);
    });
    
    it('location is the result', () => {
      assert.equal(location.name, 'Grotte Chauvet 2 - Ardèche');
    });

    it('requested location is provided location', () => {
      assert.equal(location.uid, 51665987);
    });

    it('image is provided without path', () => {
      assert.equal(location.image.split('/').length, 1);
    });
  });

  describe('deleted', () => {
    it('soft-deleted location is not accessible through get by default', async () => {
      const location = await svc.get(7630652);
      assert.equal(location, null);
    });

    it('soft-deleted location is accessible through get with option deleted:true', async () => {
      const location = await svc.get(7630652, { deleted: true });
      assert.equal(location.uid, 7630652);
    });

    it('Not soft-deleted location is not accessible through get with option deleted:true', async () => {
      const location = await svc.get(51665987, { deleted: true });
      assert.equal(location, null);
    });

    it('soft-deleted location is accessible through get with option deleted:null', async () => {
      const location = await svc.get(7630652, { deleted: null });     
      assert.equal(location.uid, 7630652);
    });

    it('Not soft-deleted location is accessible through get with option deleted:null', async () => {
      const location = await svc.get(51665987, { deleted: null });
      assert.equal(location.uid, 51665987);
    });
  });

  describe('set', () =>  {
    it('location in set is the result', async () => {
      const location = await svc.sets(1903810).locations.get(7630649);
      assert.equal(location.name, 'St André Lachamp');
    });

    it('location out of set is not found', async () => {
      const location = await svc.sets(1903810).locations.get(72498112);
      assert.equal(location, null);
    });
  });

  describe('other', () => {
    it('uid can be provided within object', async () => {
      const location = await svc.get({ uid: 51665987 });

      assert.equal(location.name, 'Grotte Chauvet 2 - Ardèche');
    });

    it('get specific fields only', async () => {
      const location = await svc.get(
        { uid: 51665987 },
        { includeFields: ['name'] }
      );
      assert.deepEqual(Object.keys(location), ['name']);
    });

    it('location can be fetched by its extId', async () => {
      const location = await svc.get({ extId: 'ard_03' });
    });

    it('uid can be provided as a string', async () => {
      const location = await svc.get('51665987');

      assert.equal(location.name, 'Grotte Chauvet 2 - Ardèche');
    });

    it('if throwOnNotFound option is true, throws NotFoundError when location is not found', async () => {
      try {
        await svc.get(67894564878453456, { throwOnNotFound: true });
      } catch (e) {
        assert.equal(e.statusCode, 404);
        return;
      }
      throw new Error('should not reach here');
    }); 

    it('if getEventCounts interface is set and eventCount option is true, location includes interface-provided event counts', async () => {
      const location = await svc(7196947).get(60763721, {
        eventCounts: true
      });

      assert.equal(location.eventCount, 12);
      assert.equal(location.agendaEventCount, 8);
    });

    it('when includeImagePath is provided, image path is in image value', async () => {
      const { image } = await svc.get(51665987, { includeImagePath: true });

      assert.ok(image.split('/').length > 1);
    });

    it('if extId is stored in store, it is loaded', async () => {
      const { extId } = await svc.get(87202261);

      assert.equal(extId, 'ard_leg_01');
    });

    it('agenda identifiers must be provided when agenda endpoint is used', async () => {
      let error;
      try {
        await svc().get(60763721);
      } catch (e) {
        error = e;
      }
      assert.equal(error.name, 'BadRequestError');
      assert.equal(error.message, 'agenda identifier is missing');
    });

    it('when includeLinkedAgendas is provided', async () => {
      const { linkedAgendas } = await svc.get(87202261, { includeLinkedAgendas : true });
      assert.deepEqual(linkedAgendas, [{ uid: 100000, title: 'BLABLA' }, { uid: 200000, title: 'BLIBLI' }])
    });
  });
});
