'use strict';

const validators = require('../src');

describe('number validator', () => {

  it('returns undefined if nothing is given on an optional validator', () => {
    const optionalValidate = validators.number({
      optional: true
    });

    expect(optionalValidate()).toBeUndefined();
  });

  it('puts a default value if and empty string is specified', () => {
    const validate = validators.number({
      default: 13
    });

    expect(validate('')).toBe(13);
  });

  it('puts a default value if nothing is specified', () => {
    const validate = validators.number({
      default: 13
    });

    expect(validate()).toBe(13);
  });

  it('default value can be 0', () => {
    expect(validators.number({ default: 0 })()).toBe(0);
  });

  it('puts a default value if is defined, nothing is specified and is required', () => {
    const requiredValidate = validators.number({
      optional: false,
      default: 8
    });

    let clean = 'not clean';
    let errors = [];

    try {
      clean = requiredValidate();
    } catch(e) {
      errors = e;
    }

    expect(errors.length).toBe(0);

    expect(clean).toBe(8);
  });

  it('throws an error if is not optional and no default is specified', () => {
    const validate = validators.number({
      optional: false
    });

    let errors = [];

    try {
      validate('');
    } catch(e) {
      errors = e;
    }

    expect(errors.length).toBe(1);

    expect(errors[ 0 ].code).toBe('required');
  });

  it('throws an error if is not optional and null default is specified', () => {
    let errors = [];

    try {
      validators.number({
        default: null,
        optional: false
      })();
    } catch(e) {
      errors = e;
    }

    expect(errors.length).toBe(1);
  });

  it('throws an error if value is not a number', () => {
    const validate = validators.number({});

    let errors = [];

    try {
      validate('fdsqfds');
    } catch(e) {
      errors = e;
    }

    expect(errors.length).toBe(1);
    expect(errors[ 0 ].code).toBe('number.invalid');
  });

  it('throws an error if value exceeds a limit', () => {
    const validate = validators.number({
      max: 10
    });

    let errors = [];

    try {
      validate('56');
    } catch(e) {
      errors = e;
    }

    expect(errors.length).toBe(1);
    expect(errors[ 0 ].code).toBe('number.toobig');
  });

  it('cleans a valid entry', () => {
    const validate = validators.number({
      field: '11or12',
      min: 11,
      max: 12,
      optional: false,
    });

    expect(validate('11')).toBe(11);
  });

  it('cleans a valid number with decimal', () => {
    const validate = validators.number();

    expect(validate('11.1')).toBe(11.1);
  });

});
