import validateSpreadLocalData from '../iso/validate/validateSpreadLocalData.js';
import fixtures from './fixtures/validateSpreadLocalData.json';

describe('validateSpreadLocalData', () => {
  let entries;
  beforeAll(() => {
    const { data, event, params } = fixtures;
    entries = validateSpreadLocalData(data, event, params);
  });

  test('validation of fourth item relies on price categories defined and validated in previous entries', () => {
    expect(entries[3]).not.toEqual({});
  });

  test('date deletion entry validation keeps only id and deleted bool', () => {
    expect(entries[4]).toEqual({ dates: [{ id: 1, deleted: true }] });
  });
});
