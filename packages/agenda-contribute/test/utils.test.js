import utils from '../src/lib/utils';
import filterEventDataFixtures from './fixtures/filterEventData.json';

const {
  filterEventData
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
  });
});
