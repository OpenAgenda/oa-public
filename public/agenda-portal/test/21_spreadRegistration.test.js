'use strict';

const spreadRegistration = require('../utils/spreadRegistration');

describe('21 - lib/utils - spreadRegistration', () => {
  test('spreads registration values in keys according to types', () => {
    const result = spreadRegistration([
      {
        type: 'link',
        value: 'https://openagenda.com'
      },
      {
        type: 'email',
        value: 'support@openagenda.com'
      },
      {
        type: 'email',
        value: 'admin@openagenda.com'
      }
    ]);

    expect(result).toEqual({
      registrationEmails: ['support@openagenda.com', 'admin@openagenda.com'],
      registrationLinks: ['https://openagenda.com'],
      registrationPhones: []
    });
  });
});
