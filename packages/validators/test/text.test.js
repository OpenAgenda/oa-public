"use strict";

var validators = require('../src');

describe('text validator', () => {

  describe('required', () => {
    const validate = validators.text({
      field: 'text',
      min: 3,
      max: 10,
      optional: false
    });

    it('trims by default', () => {
      expect(validate(' pneu ')).toBe('pneu');
    });


    it('wrong type', () => {
      try {
        validate({ grut: 'blip' });
      } catch(e) {
        expect(e[0].code).toBe('string.invalidtype')
      }
    });

    it('too long', () => {
      try {
        validate('fdssqfdsqfdsqfdsq');
      } catch(e) {
        expect(e[0].code).toBe('string.toolong');
      }
    });


    it('too short', () => {
      try {
        validate('fd');
      } catch(e) {
        expect(e[0].code).toBe('string.tooshort');
      }
    });


    it('required with default returns default when nothing is given', () => {
      const validate = validators.text({
        field: 'text',
        optional: false,
        default: 'Mama, I just killed a man, put a gun against his head, pulled my trigger now he\'s dead'
      });

      let errors = [], clean = false;

      try {
        clean = validate();
      } catch(e) {
        errors = e;
      }

      expect(errors.length).toBe(0);

      expect(clean).toBe(
        'Mama, I just killed a man, put a gun against his head, pulled my trigger now he\'s dead'
      );
    });


    it('required empty string is not valid', () => {
      const validate = validators.text({
        field: 'text',
        max: 10,
        optional: false
      });

      let errors = [];

      try {
        validate('');
      } catch(e) {
        errors = e;
      }

      expect(errors.length).toBe(1);
    });

    it('min error', () => {
      const validate = validators.text({
        field: 'text',
        min: 10
      });

      try {
        validate('short');
      } catch (errors) {
        expect(errors[0].values.min).toBe(10);
        return;
      }
      throw new Error('should not be here');
    });

  });

  describe('optional', () => {

    it('undefined cleans to null', () => {
      const validate = validators.text({ field: 'text', min: 3, max: 10 });

      expect(validate()).toBeNull();
    });

    it('null cleans to null', () => {
      const validate = validators.text({ field: 'text', min: 3, max: 10 });

      expect(validate(null)).toBeNull();
    });

    it('empty string cleans to null', () => {
      const validate = validators.text({ field: 'text', min: 3, max: 10 });

      expect(validate('')).toBeNull();
    });

  });

  describe('as list of texts', () => {

    it('validates list of text when list bool is set to true', () => {
      const validate = validators.text({
        field: 'text',
        list: true,
        optional: false
      });

      expect(validate(['fsqfsdqs', 'fds'])).toEqual(['fsqfsdqs', 'fds']);
    });

    it('considers an undefined value like an empty array when list bool is set to true', () => {
      const validate = validators.text({
        field: 'text',
        list: true
      });

      expect(validate()).toEqual([]);
    });

    it('!emptyStringAsUndefined  & min in list error', () => {
      const validate = validators.text({
        field: 'text',
        min: 1,
        emptyStringAsUndefined : false,
        list: true,
      });

      try {
        validate(['']);
      } catch (errors) {
        expect(errors[0].code).toBe('string.tooshort');
        return;
      }
      throw new Error('should not be here');
    });


    it('cleans a single value as a single list item', () => {
      const validate = validators.text({
        field: 'text',
        list: true
      });

      expect(validate('a text')).toEqual(['a text']);
    });

    it('returns null when nothing is given when given list default is null', () => {
      const validate = validators.text({
        field: 'text',
        list: { default: null }
      });

      expect(validate()).toBeNull();
    });

    it('still returns null when null is given and list default is null', () => {
      const validate = validators.text({
        field: 'text',
        list: { default: null }
      });

      expect(validate(null)).toBeNull();
    });

  });

  describe('other types', () => {

    it('validates a number such as a text', () => {
      const validate = validators.text({
        field: 'text',
        optional: false
      });

      expect(validate(42)).toBe('42');
    });

    it('does not validate non text when strict', () => {
      const validate = validators.text({
        field: 'text',
        strict: true
      });

      try {
        validate(42);
      } catch (e) {
        expect(e).toEqual([{
          field: 'text',
          code: 'string.invalidtype',
          message: 'not a string',
          origin: 42
        }]);
      }
    });

    it('validates an object such as a text', () => {
      const validate = validators.text({
        field: 'text',
        optional: false
      });

      let errors = [];

      try {
        validate({});
      } catch (e) {
        errors = e;
      }

      expect(errors.length).toBe(1);
    });

  });

  describe('fixes', () => {
    
    it('0 as integer cleans to 0 as string', () => {
      const validate = validators.text();
      
      expect(
        validate(0)
      ).toEqual('0');
    })

    it('if default is explicitely undefined, required is still required', () => {
      const validate = validators.text({
        optional: false,
        default: undefined
      });

      try {
        validate();
      } catch (e) {
        expect(e[0].code).toEqual('required');
        return;
      }

      throw 'never here';
    });
  });

});
