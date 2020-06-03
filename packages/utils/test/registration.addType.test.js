'use strict';

const addType = require('../registration/addType');

describe('utils - registration addType', () => {

  it('decorates list of registration links/emails/phone numbers with their types', () => {
    const mapped = addType([
      'https://openagenda.com',
      '+33650916226',
      'support@openagenda.com'
    ]);

    expect(mapped).toEqual([{
      type: 'link',
      value: 'https://openagenda.com'
    }, {
      type: 'phone',
      value: '+33650916226'
    }, {
      type: 'email',
      value: 'support@openagenda.com'
    }]);
  });

  it('handles single item', () => {
    const withType = addType('my@email.com');

    expect(withType).toEqual({
      type: 'email',
      value: 'my@email.com'
    });
  });

  it('throws error if type is not known', () => {
    let error;
    try {
      addType('fdsqfdsq');
    } catch (e) {
      error = e;
    }
    expect(error.message).toEqual('Unknown type');
  });

  it('returns undefined type if unknownAsUndefined option is true', () => {
    const result = addType('sdqfdsq', { unknownAsUndefined: true });
    expect(result).toEqual({
      value: 'sdqfdsq',
      type: undefined
    });
  });

  it('in case of list, unknown types are filtered out if filterUnknown option is true', () => {
    const withType = addType([
      'fdsqsdqfsd',
      '+33650916226',
      'support@openagenda.com'
    ], {
      filterUnknown: true
    });

    expect(withType).toEqual([{
      type: 'phone',
      value: '+33650916226',
    }, {
      type: 'email',
      value: 'support@openagenda.com'
    }]);
  });

});
