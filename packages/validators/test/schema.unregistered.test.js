import validators from '../src';
import schema from '../src/schema';

describe('schema validator', () => {
  describe('schema with few registered validators', () => {
    beforeAll(() => {
      schema.register({
        link: validators.link
      });
    });

    it('validates an object with a basic schema', () => {
      let error;
      const validate = schema({
        uid: {
          type: 'integer'
        }
      });

      try {
        validate(123);
      } catch (e) {
        error = e;
      }
      expect(error.message).toBe('Unregistered type: integer');
    });
  });
});
