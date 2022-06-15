import utils from '../src/lib/utils';
import filterEventDataFixtures from './fixtures/filterEventData.json';
import filterEventDataFixturesWiths from './fixtures/filterEventDataWiths.json';

const {
  filterEventData,
  schemaWithoutEventFields
} = utils;

describe('utils', () => {
  describe('filterEventData', () => {
    test('if event fields are not displayed on app, they are filtered', () => {
      const {
        event,
        schema,
      } = filterEventDataFixtures;

      const filteredEvent = filterEventData({
        event,
        canEditEvent: true,
        canChangeState: true,
        schema,
        displayEventFields: false
      });

      expect(filteredEvent).toEqual({
        state: 2
      });
    });

    test('event fields are not kept if edit event authorization is not given', () => {
      const {
        event,
        schema,
      } = filterEventDataFixtures;

      const filteredEvent = filterEventData({
        event,
        canEditEvent: false,
        canChangeState: true,
        schema,
        displayEventFields: false
      });

      expect(filteredEvent).toEqual({ state: 2 });
    });

    test('event field values are provided when linked to a field where authorization is provided', () => {
      const {
        event,
        schema
      } = filterEventDataFixturesWiths;

      const filteredEvent = filterEventData({
        event,
        canEditEvent: false,
        canChangeState: true,
        schema,
        displayEventFields: false
      });

      expect(Object.keys(filteredEvent)).toEqual(['state', 'image']);
    });
  });
  describe('schemaWithoutEventFields', () => {
    test('event fields linked to extended fields are included but not enabled', () => {
      const filtered = schemaWithoutEventFields(filterEventDataFixturesWiths.schema);

      expect(filtered.fields.find(f => f.field === 'image').enable).toBe(false);
    });
  });
});
