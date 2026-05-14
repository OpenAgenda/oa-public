import eventSchema from '../src/schema.js';
import mdbLegacyFixtures from './fixtures/mdb.legacy.json' with { type: 'json' };
import mdbFixtures from './fixtures/mdb.json' with { type: 'json' };

describe('event schema formatting', () => {
  describe('mdb', () => {
    test('event schema generates same field list than the one provided in detailed agenda configuration excluding write internal fields', () => {
      const es = eventSchema({
        languages: [],
        schemaExtensions: mdbLegacyFixtures.schemaExtensions,
      });

      expect(es.fields.map((f) => f.field)).toEqual(
        mdbFixtures.schema.fields
          .filter((f) => !(f.write ?? []).includes('internal'))
          .map((f) => f.field),
      );
    });
  });
});
