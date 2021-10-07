'use strict';

const _ = require('lodash');

const Files = require('@openagenda/files');

const {
  service: config,
  dependencies: dConfig,
} = require('../testconfig.sample');

const Service = require('..');
const fixtures = require('./fixtures');

async function getAgendaDetailsByUid(uid, fields = []) {
  return _.pick(
    {
      id: { 7196947: 30907 }[uid],
      locationSetUid: { 7196947: 1903810 }[uid],
    },
    fields
  );
}

describe('agenda-locations - functional - Duplicates functions', () => {
  const f = fixtures(config.mysql, 'hauteSavoie.sql');

  let svc;

  beforeAll(async () => {
    await f.load();
  });

  beforeAll(() => {
    svc = Service({
      knex: f.client,
      Files: Files(dConfig.files),
      imagePath: '//cibuldev.s3.amazonaws.com/',
      interfaces: {
        getAgendaDetailsByUid,
      },
      duplicates: {
        geoThreshold: 40,
        nameDistanceThreshold: 10,
      },
    });
  });

  describe('detectDuplicateCandidates with sample', () => {
    const location = {
      name: 'Château de Montrottier - Musée Léon Marès',
      latitude: 45.898752,
      longitude: 6.040199,
    };

    it('detects one duplicate candidate', async () => {
      const candidates = await svc(7196947).duplicates.detect(location);
      expect(candidates).toStrictEqual([77635823, 77635822]);
    });

    it('detects one duplicate candidate through SetUid', async () => {
      const candidates = await svc.sets(1903810).locations.duplicates.detect(location);
      expect(candidates).toStrictEqual([77635823, 77635822]);
    });

    it('save option with sample', async () => {
      let thrownError;
      try {
        await svc(7196947).duplicates.detect(location, { saveCandidates: true });
      } catch (e) {
        thrownError = e;
        return (e);
      }
      expect(thrownError.name).toEqual('Bad request');
      throw new Error('Should have thrown an error');
    });
  });

  describe('detectDuplicateCandidates with uid && save option', () => {
    it('save candidates in both location`s field', async () => {
      await svc(7196947).duplicates.detect(77635822, { saveCandidates: true });
      const entry1 = await f.client('location').first().where('uid', 77635822);
      const entry2 = await f.client('location').first().where('uid', 77635823);
      expect(JSON.parse(entry1.duplicates).candidates).toStrictEqual([77635823]);
      expect(JSON.parse(entry2.duplicates).candidates).toStrictEqual([77635822]);
    });
  });

  describe('disqualify duplicate', () => {
    let entry1;
    let entry2;

    beforeAll(async () => {
      await svc(7196947).duplicates.disqualifyCandidate([77164958, 90760072]);
      entry1 = await f.client('location').first().where('uid', 90760072);
      entry2 = await f.client('location').first().where('uid', 77164958);
    });

    it('both location uid are not in each other candidates anymore', () => {
      expect(JSON.parse(entry1.duplicates).candidates).toStrictEqual([]);
      expect(JSON.parse(entry2.duplicates).candidates).toStrictEqual([]);
    });

    it('both location uid are now in each other disqualified duplicates', () => {
      expect(JSON.parse(entry1.duplicates).disqualified).toStrictEqual([77164958]);
      expect(JSON.parse(entry2.duplicates).disqualified).toStrictEqual([90760072]);
    });
  });

  describe('detect all duplicates', () => {
    beforeAll(async () => {
      await svc(7196947).duplicates.detectAll();
    });

    it('duplicates are found and saved', async () => {
      const entry1 = await f.client('location').first().where('uid', 48681219);
      const entry2 = await f.client('location').first().where('uid', 62705984);
      expect(JSON.parse(entry1.duplicates).candidates).toStrictEqual([62705984]);
      expect(JSON.parse(entry2.duplicates).candidates).toStrictEqual([48681219]);
    });
  });

  describe('clear all candidates', () => {
    let entry1;
    let entry2;
    beforeAll(async () => {
      await svc(7196947).duplicates.clearCandidates();
      entry1 = await f.client('location').first().where('uid', 49975881);
      entry2 = await f.client('location').first().where('uid', 49975880);
    });

    it('clear all candidates', () => {
      expect(JSON.parse(entry1.duplicates).candidates).toStrictEqual([]);
      expect(JSON.parse(entry2.duplicates).candidates).toStrictEqual([]);
    });

    it('doesn`t change the disqualified', () => {
      expect(JSON.parse(entry1.duplicates).disqualified).toStrictEqual([1]);
    });
  });
});
