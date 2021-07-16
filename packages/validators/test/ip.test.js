import validators from '../src';

describe('ip validator', () => {
  const validate = validators.ip({ field: 'ip' });

  it('is an ip', () => {
    expect(validate('191.168.0.1')).toBe('191.168.0.1');
  });

  it('is not an ip', () => {
    let errors;

    try {
      validate('nimpornawak');
    } catch (e) {
      errors = e;
    }

    expect(errors).toEqual([{
      origin: 'nimpornawak',
      field: 'ip',
      code: 'ip.invalid',
      message: 'ip address is invalid'
    }]);
  });

  describe('lists', () => {
    const validateList = validators.ip({ field: 'ip', list: true });

    it('is a list of ips', () => {
      expect(validateList([
        '192.3.1.2',
        '192.12.0.1'
      ])).toEqual([
        '192.3.1.2',
        '192.12.0.1'
      ]);
    });

    it('nothing given to list returns an empty list', () => {
      expect(validateList()).toEqual([]);
    });

    it('null given to list returns an empty list', () => {
      expect(validateList(null)).toEqual([]);
    });
  });
});
