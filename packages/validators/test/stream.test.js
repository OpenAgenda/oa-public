'use strict';

const { Stream } = require('stream');

const assert = require('assert');
const fs = require('fs');

const validators = require('../src');

const stream = fs.createReadStream(__dirname + '/../src/stream.js');

describe('stream validator', () => {

  it('validates a stream', () => {
    const validate = validators.stream();

    const value = validate(stream);

    assert.equal(value instanceof Stream, true);
  });

  it('throws error if not a stream', () => {
    const validate = validators.stream();

    try {
      validate('Ceci est un stream');
    } catch (errors) {
      assert.deepEqual(errors, [{
        origin: 'Ceci est un stream',
        field: undefined,
        code: 'stream.invalid',
        message: 'value is not a stream'
      }]);
      return;
    }

    throw new Error('validate did not throw error');
  });

  it('type and field name are accessible on validate', () => {
    const validate = validators.stream({
      field: 'image'
    });

    assert.equal(validate.field, 'image');
    assert.equal(validate.type, 'stream');
  });

});
