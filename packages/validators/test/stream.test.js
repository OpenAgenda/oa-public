import { Stream } from 'stream';
import fs from 'fs';
import validators from '../src/index.js';

const stream = fs.createReadStream(`${import.meta.dirname}/../src/stream.js`);

describe('stream validator', () => {
  it('validates a stream', () => {
    const validate = validators.stream();

    const value = validate(stream);

    expect(value instanceof Stream).toBe(true);
  });

  it('throws error if not a stream', () => {
    const validate = validators.stream();

    let errors;

    try {
      validate('Ceci est un stream');
    } catch (e) {
      errors = e;
    }

    expect(errors).toEqual([
      {
        origin: 'Ceci est un stream',
        code: 'invalid',
        message: 'value is not a stream',
      },
    ]);
  });

  it('type and field name are accessible on validate', () => {
    const validate = validators.stream({
      field: 'image',
    });

    expect(validate.field).toBe('image');
    expect(validate.type).toBe('stream');
  });

  it('default', () => {
    const validate = validators.stream({
      field: 'image',
      default: null,
    });

    expect(validate()).toBeNull();
  });

  it('allowNull', () => {
    const validate = validators.stream({
      allowNull: true,
    });

    expect(validate(null)).toBeNull();
  });

  it('allowObject', () => {
    const validate = validators.stream({
      allowObject: true,
    });

    expect(validate({})).toEqual({});
  });
});
