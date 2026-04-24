'use strict';

const _ = require('lodash');

const Files = require('@openagenda/files');

const Service = require('..');
const { service: config, dependencies: dConfig } = require('./testconfig');

const setup = require('./fixtures/setup');

describe('agenda-locations - functional - get', () => {
  let knex;
  let svc;

  beforeAll(async () => {
    knex = await setup({
      mysql: config.mysql,
      schemas: config.schemas,
      data: [`${__dirname}/fixtures/ardeche/rows.sql`],
    });

    svc = Service({
      knex,
      Files: Files(dConfig.files),
      imagePath: '//cdn.openagenda.com/dev/',
      interfaces: {
        getAgendaDetailsByUid: async (uid, fields = []) =>
          _.pick(
            {
              id: {
                7196947: 25221,
              }[uid],
              locationSetUid: {
                7196947: 1903810,
              }[uid],
            },
            fields,
          ),
        getEventCounts: async (/* locationUids, { agendaUid } */) => [
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
        getLinkedAgendas: async (/* locationUid */) => [
          {
            uid: 100000,
            title: 'BLABLA',
          },
          {
            uid: 200000,
            title: 'BLIBLI',
          },
        ],
        getAgendaUidsByIds: async (agendaId) => ({
          uid: 789327189,
          id: agendaId,
        }),
      },
    });
  });

  afterAll(() => knex?.destroy());

  describe('defaults', () => {
    let location;

    beforeAll(async () => {
      location = await svc.get(51665987);
    });

    it('location is the result', () => {
      expect(location.name).toBe('Grotte Chauvet 2 - Ardèche');
    });

    it('requested location is provided location', () => {
      expect(location.uid).toBe(51665987);
    });

    it('image is provided without path', () => {
      expect(location.image.split('/').length).toBe(1);
    });

    it('duplicates candidates && disqualified are in result', () => {
      expect({
        duplicateCandidates: location.duplicateCandidates,
        disqualifiedDuplicates: location.disqualifiedDuplicates,
      }).toStrictEqual({
        duplicateCandidates: [51665986],
        disqualifiedDuplicates: [5],
      });
    });
    it('admin lvl1', () => {
      expect(location.adminLevel1).toBe('Auvergne-Rhône-Alpes');
    });
    it('admin lvl2', () => {
      expect(location.adminLevel2).toBe('Ardèche');
    });
  });

  describe('deleted', () => {
    it('soft-deleted location is not accessible through get by default', async () => {
      const location = await svc.get(7630652);
      expect(location).toBeNull();
    });

    it('soft-deleted location is accessible through get with option deleted:true', async () => {
      const location = await svc.get(7630652, { deleted: true });
      expect(location.uid).toBe(7630652);
      expect(location.deleted).toBe(1);
      expect(Object.keys(location).sort()).toEqual(
        ['deleted', 'mergedIn', 'uid'].sort(),
      );
    });

    it('Not soft-deleted location is not accessible through get with option deleted:true', async () => {
      const location = await svc.get(51665987, { deleted: true });
      expect(location).toBeNull();
    });

    it('soft-deleted location is accessible through get with option deleted:null', async () => {
      const location = await svc.get(7630652, { deleted: null });
      expect(location.uid).toBe(7630652);
      expect(location.deleted).toBe(1);
      expect(Object.keys(location).sort()).toEqual(
        ['deleted', 'mergedIn', 'uid'].sort(),
      );
    });

    it('Not soft-deleted location is accessible through get with option deleted:null', async () => {
      const location = await svc.get(51665987, { deleted: null });
      expect(location.uid).toBe(51665987);
      expect(location.deleted).toBe(0);
    });

    it('non-deleted location does NOT return deleted field by default', async () => {
      const location = await svc.get(51665987);
      expect(location.deleted).toBeUndefined();
    });
  });

  describe('set', () => {
    it('location in set is the result', async () => {
      const location = await svc.sets(1903810).locations.get(7630649);
      expect(location.name).toBe('St André Lachamp');
    });

    it('location out of set is not found', async () => {
      const location = await svc.sets(1903810).locations.get(72498112);
      expect(location).toBeNull();
    });
  });

  describe('other', () => {
    it('uid can be provided within object', async () => {
      const location = await svc.get({ uid: 51665987 });

      expect(location.name).toBe('Grotte Chauvet 2 - Ardèche');
    });

    it('get specific fields only', async () => {
      const location = await svc.get(
        { uid: 51665987 },
        { includeFields: ['name'] },
      );
      expect(Object.keys(location)).toStrictEqual(['name']);
    });

    it('location can be fetched by its extIds', async () => {
      const locationByUid = await svc.get({ uid: 7630653 });
      const location = await svc.get({
        extId: { key: 'default', value: '1234' },
      });
      expect(locationByUid.uid).toBe(7630653);
      expect(location.uid).toBe(7630653);
    });

    it('location extIds can be asked for', async () => {
      const location = await svc.get({ uid: 7630653 });
      expect(location.extIds).toStrictEqual([
        { key: 'default', value: '1234' },
      ]);
    });

    it('location can be fetched by its slug', async () => {
      const location = await svc.get({ slug: 'saint-paul-le-jeune' });
      expect(location.name).toBe('Saint-Paul-le-Jeune');
    });

    it('uid can be provided as a string', async () => {
      const location = await svc.get('51665987');

      expect(location.name).toBe('Grotte Chauvet 2 - Ardèche');
    });

    it('if throwOnNotFound option is true, throws NotFound when location is not found', async () => {
      let error;
      try {
        await svc.get(67894564878453456, { throwOnNotFound: true });
      } catch (e) {
        error = e;
      }
      expect(error.code).toBe(404);
    });

    it('if getEventCounts interface is set and eventCount option is true, location includes interface-provided event counts', async () => {
      const location = await svc(7196947).get(60763721, {
        eventCounts: true,
      });

      expect(location.eventCount).toBe(12);
      expect(location.agendaEventCount).toBe(8);
    });

    it('when includeImagePath is provided, image path is in image value', async () => {
      const { image } = await svc.get(51665987, { includeImagePath: true });

      expect(image.split('/').length).toBeGreaterThan(1);
    });

    it('when includeFields is set and includes "agendaUid", agendaUid key is in result', async () => {
      const l = await svc.get(51665987, { includeFields: ['agendaUid'] });
      expect(l.agendaUid).toBe(789327189);
    });

    it('fix: when includeImagePath is provided but location has no image, path is not added', async () => {
      const { image } = await svc(7196947).get(86591143, {
        includeImagePath: true,
      });

      expect(image).toBe(null);
    });

    it('agenda identifiers must be provided when agenda endpoint is used', async () => {
      let error;
      try {
        await svc().get(60763721);
      } catch (e) {
        error = e;
      }
      expect(error.name).toBe('BadRequest');
      expect(error.message).toBe('agenda identifier is missing');
    });

    it('when includeLinkedAgendas is provided', async () => {
      const { linkedAgendas } = await svc.get(87202261, {
        includeLinkedAgendas: true,
      });
      expect(linkedAgendas).toStrictEqual([
        { uid: 100000, title: 'BLABLA' },
        { uid: 200000, title: 'BLIBLI' },
      ]);
    });

    it('when returnMergeTarget is provided', async () => {
      const location = await svc.get(7630652, { returnMergeTarget: true });
      expect(location.uid).toBe(51665986);
    });
  });
});
