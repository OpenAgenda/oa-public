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

      expect(
        es.fields.map(f => f.field)
      ).toEqual(
        mdbFixtures.schema.fields.filter(f => !(f.write ?? []).includes('internal')).map(f => f.field)
      );
    });
  });
});