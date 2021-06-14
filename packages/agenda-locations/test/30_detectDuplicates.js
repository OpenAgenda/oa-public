'use strict';

const assert = require('assert');
const _ = require('lodash');

const Files = require('@openagenda/files');
const buildDistancesAndEvaluate = require('../duplicates/buildDistancesAndEvaluate');

const {
  service: config,
  dependencies: dConfig,
} = require('../testconfig.sample');

const fixtures = require('./fixtures');
const Service = require('..');

async function getAgendaDetailsByUid(uid, fields = []) {
  return _.pick(
    {
      id: { 7196947: 30907 }[uid],
      locationSetUid: { 7196947: 1903810 }[uid],
    },
    fields
  );
}

describe('agenda-locations - functional - Duplicates functions', function () {
  this.timeout(10000);

  const f = fixtures(config.mysql, 'hauteSavoie.sql');

  let svc;

  before(async () => {
    await f.load();
  });

  before(() => {
    svc = Service({
      knex: f.client,
      Files: Files(dConfig.files),
      imagePath: '//cibuldev.s3.amazonaws.com/',
      interfaces: {
        getAgendaDetailsByUid,
      },
      duplicates: {
        scoreThreshold: 200,
        weights: {
          geo: 1,
          levensteinName: 15,
        },
      },
    });
  });


  describe('buildDistancesAndEvaluate', () => {
    const config = {
      scoreThreshold: 200,
      weights: {
        geo: 1,
        levensteinName: 15,
      },
    };

    it('a location with different name is not marked as a duplicate', () => {
      const res = buildDistancesAndEvaluate({
        name: 'Grotte Chauvet 2 - Ardèche',
        latitude: 44.406684,
        longitude: 4.429893,
      }, {
        name: 'Caverne du Pont d`Arc',
        latitude: 44.406684,
        longitude: 4.429893,
      }, config);
      assert.strictEqual(res, false);
    });
    it('a location with a very similar name is marked as a duplicate', () => {
      const res = buildDistancesAndEvaluate({
        name: 'Grotte Chauvet 2 - Ardèche',
        latitude: 44.406684,
        longitude: 4.429893,
      }, {
        name: 'Grotte Chauvet',
        latitude: 44.406685,
        longitude: 4.429894,
      }, config);
      assert.strictEqual(res, true);
    })
    it('if same extId marked as duplicate', () => {
      const res = buildDistancesAndEvaluate({
        name: 'Grotte Chauvet 2 - Ardèche',
        latitude: 44.406684,
        longitude: 4.429893,
        extId: 100,
      }, {
        name: 'Same extId',
        latitude: 144.406685,
        longitude: 14.429894,
        extId: 100,
      }, config);
      assert.strictEqual(res, true);
    })
  });

  describe('detectDuplicateCandidates with sample', () => {
    const location = {
      name: 'Château de Montrottier - Musée Léon Marès',
      latitude: 45.898752,
      longitude: 6.040199,
    };
    
    it('detects one duplicate candidate', async () => {
      const candidates = await svc(7196947).duplicates.detect(location);
      assert.deepStrictEqual(candidates, [77635823, 77635822]);
    });

    it('detects one duplicate candidate through SetUid', async () => {
      const candidates = await svc.sets(1903810).locations.duplicates.detect(location);
      assert.deepStrictEqual(candidates, [77635823, 77635822]);
    });

    it('save option with sample', async () => {
      try {
        await svc(7196947).duplicates.detect(location,{ saveCandidates: true });
      }
      catch(e) {
        assert(e.message, 'Bad request');
        return(e);
      }
      throw new Error('Should have thrown an error');
    });
  });

  describe('detectDuplicateCandidates with uid && save option', () => {

    it('save candidates in both location`s field', async () => {
      await svc(7196947).duplicates.detect(77635822,{ saveCandidates: true });
      const entry1 = await f.client('location').first().where('uid', 77635822);
      const entry2 = await f.client('location').first().where('uid', 77635823);
      assert.deepStrictEqual(JSON.parse(entry1.duplicates).candidates, [77635823]);
      assert.deepStrictEqual(JSON.parse(entry2.duplicates).candidates, [77635822]);
    });
  });

  describe('disqualify duplicate', async () => {
    let entry1;
    let entry2;

    before(async () => {
      await svc(7196947).duplicates.disqualifyCandidate(77164958, 90760072);
      entry1 = await f.client('location').first().where('uid', 90760072);
      entry2 = await f.client('location').first().where('uid', 77164958);
    })
    it('both location uid are not in each other candidates anymore', () => {
      assert.deepStrictEqual(JSON.parse(entry1.duplicates).candidates, []);
      assert.deepStrictEqual(JSON.parse(entry2.duplicates).candidates, []);
    });
    it('both location uid are now in each other disqualified duplicates', () => {
      assert.deepStrictEqual(JSON.parse(entry1.duplicates).disqualified, [77164958]);
      assert.deepStrictEqual(JSON.parse(entry2.duplicates).disqualified, [90760072]);
    });
  });

  describe('detect all duplicates', async () => {
    before(async () => {
      await svc(7196947).duplicates.detectAll();
    });
    it('duplicates are found and saved', async () => {
      const entry1 = await f.client('location').first().where('uid', 48681219);
      const entry2 = await f.client('location').first().where('uid', 62705984);
      assert.deepStrictEqual(JSON.parse(entry1.duplicates).candidates, [62705984]);
      assert.deepStrictEqual(JSON.parse(entry2.duplicates).candidates, [48681219]);

    })
  })
  
  describe('clear all candidates', async () => {
    let entry1;
    let entry2;
    before(async ()=> {
        await svc(7196947).duplicates.clearCandidates();
        entry1 = await f.client('location').first().where('uid', 49975881);
        entry2 = await f.client('location').first().where('uid', 49975880);
      })
    it('clear all candidates', () => {
      assert.deepStrictEqual(JSON.parse(entry1.duplicates).candidates, []);
      assert.deepStrictEqual(JSON.parse(entry2.duplicates).candidates, []);
    });
    it('doesn`t change the disqualified', () => {
      assert.deepStrictEqual(JSON.parse(entry1.duplicates).disqualified, [1]);
    });
  
  });
});
