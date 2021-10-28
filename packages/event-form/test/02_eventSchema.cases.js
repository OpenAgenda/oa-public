const eventSchema = require('../src/schema');
const mdbLegacyFixtures = require('./fixtures/mdb.legacy.json');
const mdbFixtures = require('./fixtures/mdb.json');

describe('event schema formatting', () => {
  describe('mdb', () => {
    test('event schema generates same field list than the one provided in detailed agenda configuration excluding write internal fields', () => {
      const es = eventSchema({
        languages: [],
        schemaExtensions: mdbLegacyFixtures.schemaExtensions
      });

      const es = eventScheam({
        languages: [],
        schema: 
      });

      // I get an agenda configuration without the language field...
      // I need it.

      // console.log(es.fields.map(f => f.field));

      [
        'categorie',       'title',
        'image',           'imageCredits',
        'timings',         'attendanceMode',
        'location',        'onlineAccessLink',
        'description',     'keywords',
        'longDescription', 'conditions',
        'age',             'registration',
        'accessibility',   'languages',
        'status'
      ]

      [
        'categorie',       'title',
        'image',           'imageCredits',
        'timings',         'attendanceMode',
        'location',        'onlineAccessLink',
        'description',     'keywords',
        'longDescription', 'conditions',
        'age',             'registration',
        'accessibility',   'status'
      ]

      // console.log(mdbFixtures.schema.fields.filter(f => !(f.write ?? []).includes('internal')).map(f => f.field));

      [
        'categorie',       'title',
        'image',           'imageCredits',
        'timings',         'attendanceMode',
        'location',        'onlineAccessLink',
        'description',     'keywords',
        'longDescription', 'conditions',
        'age',             'registration',
        'accessibility',   'uid',
        'slug',            'private',
        'timezone',        'draft',
        'createdAt',       'creatorUid',
        'ownerUid',        'updatedAt',
        'agendaUid',       'locationUid',
        'status',          'references',
        'links'
      ]
  

      //expect(es.fields).toEqual(mdbFixtures.schema.fields);
    });
  });
});