'use strict';

const validateOptions = require('../lib/transform/options.validate');

test('validate spreadsheet export options', () => {
  const cleanOptions = validateOptions({ includeLanguages: 'fr' });
  expect(Array.isArray(cleanOptions.includeLanguages)).toBeTruthy();
});
