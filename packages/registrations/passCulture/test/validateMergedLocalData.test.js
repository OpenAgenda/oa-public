import validateMergedLocalData from '../iso/validate/validateMergedLocalData.js';
import fixtures from './fixtures/validateMergedLocalData.json';

describe('validateMergedLocalData', () => {
  test('if a date does not match a timing, the validation error shows invalid.timingId', () => {
    const { current, event, params } = fixtures;

    let error;

    try {
      validateMergedLocalData(current, event, params);
    } catch (e) {
      error = e;
    }

    expect(error.name).toBe('BadRequest');
    expect(error.info.errors[0].code).toBe('invalid.timingId');
  });
});
