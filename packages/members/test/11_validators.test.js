'use strict';

const validate = require('../lib/validate');

describe('members - unit - validate', () => {
  test('simple validation', () => {
    const clean = validate({
      role: 1,
      agendaUid: 1,
      userUid: 1
    });

    expect(clean).toEqual({
      agendaUid: 1,
      userUid: 1,
      createdAt: undefined,
      updatedAt: undefined,
      custom: undefined,
      deletedUser: false,
      role: 1
    });
  });

  test('validation with custom data validation', () => {
    const clean = validate.withCustom(false)({
      role: 1,
      agendaUid: 1,
      userUid: 1
    });

    expect(clean).toEqual({
      agendaUid: 1,
      userUid: 1,
      createdAt: undefined,
      updatedAt: undefined,
      custom: {
        organization: null,
        contactName: null,
        contactNumber: null,
        contactPosition: null,
        email: null
      },
      deletedUser: false,
      role: 1
    });
  });

  test('validate custom data only', () => {
    const validateCustom = validate.custom(false);

    const clean = validateCustom({
      organization: 'OA'
    });

    expect(clean).toEqual({
      contactName: null,
      contactNumber: null,
      contactPosition: null,
      email: null,
      organization: 'OA'
    });
  });
});
