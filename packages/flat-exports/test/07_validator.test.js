import validateOptions from '../lib/transform/options.validate.js';

test('validate spreadsheet export options', () => {
  const cleanOptions = validateOptions({ includeLanguages: 'fr' });
  expect(Array.isArray(cleanOptions.includeLanguages)).toBeTruthy();
});
