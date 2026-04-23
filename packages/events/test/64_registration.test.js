import Service from '../index.js';
import registrationValidator from '../iso/validators/registration.js';

const { formatRegistration } = Service.utils;

describe('registration', () => {
  describe('validate', () => {
    it('takes phone numbers, emails or links, cleans by giving back associated', () => {
      const validate = registrationValidator();
      const clean = validate([
        '0650606129',
        'https://alink.com',
        'an@email.com',
      ]);

      expect(clean).toEqual([
        { type: 'phone', value: '0650606129' },
        { type: 'link', value: 'https://alink.com' },
        { type: 'email', value: 'an@email.com' },
      ]);
    });

    it('takes data as list of type,value pairs, cleans and gives back the same', () => {
      const validate = registrationValidator();

      const clean = validate([
        { type: 'phone', value: '0650606129' },
        { type: 'link', value: 'https://alink.com' },
        { type: 'email', value: 'an@email.com' },
      ]);

      expect(clean).toEqual([
        { type: 'phone', value: '0650606129' },
        { type: 'link', value: 'https://alink.com' },
        { type: 'email', value: 'an@email.com' },
      ]);
    });

    it('is optional by default', () => {
      const validate = registrationValidator();

      const clean = validate();

      expect(clean).toEqual([]);
    });

    it('can be required', () => {
      const validate = registrationValidator({ optional: false });
      let errors;

      try {
        validate();
      } catch (e) {
        errors = e;
      }

      expect(errors).toEqual([
        {
          origin: undefined,
          code: 'required',
          message: 'value must not be empty',
        },
      ]);
    });

    it('throws required when given an empty array', () => {
      const validate = registrationValidator({ optional: false });
      let errors;

      try {
        validate([]);
      } catch (e) {
        errors = e;
      }

      expect(errors).toEqual([
        {
          origin: [],
          code: 'required',
          message: 'value must not be empty',
        },
      ]);
    });

    it('throws required when given an array of only null/undefined values', () => {
      const validate = registrationValidator({ optional: false });
      let errors;

      try {
        validate([null, undefined]);
      } catch (e) {
        errors = e;
      }

      expect(errors).toEqual([
        {
          origin: [null, undefined],
          code: 'required',
          message: 'value must not be empty',
        },
      ]);
    });

    it('field is specified in provided validation error if was provided to validator', () => {
      const validate = registrationValidator({
        optional: false,
        field: 'registration',
      });
      let errors;

      try {
        validate();
      } catch (e) {
        errors = e;
      }

      expect(errors).toEqual([
        {
          origin: undefined,
          code: 'required',
          message: 'value must not be empty',
          field: 'registration',
        },
      ]);
    });
  });

  describe('formatRegistration', () => {
    it('if order option is provided, sorts registration values according to provided types in option', () => {
      const formatted = formatRegistration(
        [
          '01 09 09183',
          'romain@oa.com',
          'https://link.com',
          'https://otherlink.com',
          'email@email.com',
        ],
        {
          order: ['email', 'phone', 'link'],
        },
      );

      expect(formatted).toEqual([
        'email@email.com',
        'romain@oa.com',
        '01 09 09183',
        'https://otherlink.com',
        'https://link.com',
      ]);
    });

    it('if includeLinkPrefix option is true, appends registration value with corresponding link prefix', () => {
      const formatted = formatRegistration(
        [
          '01 09 09183',
          'romain@oa.com',
          'link.com',
          'https://otherlink.com',
          'email@email.com',
        ],
        {
          includeLinkPrefix: true,
        },
      );

      expect(formatted).toEqual([
        'tel:01 09 09183',
        'mailto:romain@oa.com',
        'https://link.com',
        'https://otherlink.com',
        'mailto:email@email.com',
      ]);
    });

    it('if useTypeKeys option is true, assigns values to keys matching their types', () => {
      const formatted = formatRegistration(
        [
          '01 09 09183',
          'romain@oa.com',
          'https://link.com',
          'https://otherlink.com',
          'email@email.com',
        ],
        {
          useTypeKeys: true,
        },
      );

      expect(formatted).toEqual({
        link: ['https://link.com', 'https://otherlink.com'],
        phone: ['01 09 09183'],
        email: ['romain@oa.com', 'email@email.com'],
      });
    });

    it('if undefined is provided, returns empty array', () => {
      expect(formatRegistration()).toEqual([]);
    });

    it('if null is provided, returns empty array', () => {
      expect(formatRegistration(null)).toEqual([]);
    });

    it('if invalid type is provided, it is filtered out', () => {
      expect(formatRegistration(['fdsqfdqs'])).toEqual([]);
    });
  });
});
