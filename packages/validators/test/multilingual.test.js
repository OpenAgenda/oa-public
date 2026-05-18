import multilingual from '../src/multilingual.js';

describe('multilingual validator', () => {
  describe('non optional', () => {
    const validate = multilingual({
      field: 'multitext',
      min: 3,
      optional: false,
    });

    it('gives text errors with associated lang', () => {
      let errors = [];

      try {
        validate({
          en: 'En',
          fr: 'Contenu Français',
        });
      } catch (e) {
        errors = e;
      }

      expect(errors.length).toBe(1);

      expect(errors[0]).toEqual({
        field: 'multitext',
        code: 'string.tooshort',
        message: 'the string is too short',
        values: {
          min: 3,
          max: 1000000,
        },
        origin: 'En',
        lang: 'en',
      });
    });

    it('validates and cleans multilingual content', () => {
      const clean = validate({
        en: 'English content',
        fr: 'Contenu Français',
      });

      expect(clean).toEqual({
        en: 'English content',
        fr: 'Contenu Français',
      });
    });

    it('empty input on non-optional validator means an error', () => {
      let errors = [];

      try {
        validate();
      } catch (e) {
        errors = e;
      }

      expect(errors.length).toBe(1);

      expect(errors[0]).toEqual({
        field: 'multitext',
        code: 'required',
        message: 'at least one language entry is required',
        origin: undefined,
      });
    });
  });

  describe('preset languages', () => {
    const validate = multilingual({
      languages: ['fr', 'en'],
    });

    const validateWithDefaultLang = multilingual({
      defaultLanguage: 'fr',
    });

    it('nothing given returns languages with null', () => {
      const clean = validate();

      expect(clean).toEqual({
        fr: null,
        en: null,
      });
    });

    it('something given returns clean results', () => {
      const clean = validate({
        fr: 'Un super validateur',
        en: 'A nifty validator',
      });

      expect(clean).toEqual({
        fr: 'Un super validateur',
        en: 'A nifty validator',
      });
    });

    it('default preset language is "en" for some reason', () => {
      const validateWithDefaultLang = multilingual();

      const result = validateWithDefaultLang('There');

      expect(result).toEqual({ en: 'There' });
    });

    it('if a string is given, it is associated to the set default language', () => {
      const clean = validateWithDefaultLang('Un super validateur');

      expect(clean).toEqual({ fr: 'Un super validateur' });
    });

    it('if no default language is preset and string is given, it is spread throughout languages', () => {
      const clean = validate('Un super validateur');

      expect(clean).toEqual({
        fr: 'Un super validateur',
        en: 'Un super validateur',
      });
    });

    it('a non optional validator returns required errors on omitted languages', () => {
      const validateRequired = multilingual({
        optional: false,
        languages: ['fr', 'en'],
      });

      let error;

      try {
        validateRequired({
          fr: 'Cette langue',
        });
      } catch (e) {
        error = e;
      }

      expect(error).toEqual([
        {
          lang: 'en',
          code: 'required',
          message: 'a string is required',
          origin: '',
        },
      ]);
    });

    it('a non optional validator returns errors when given null on requested langauges', () => {
      const validateRequired = multilingual({
        optional: false,
        languages: ['fr', 'en'],
      });

      let error;

      try {
        validateRequired({
          fr: 'Cette langue',
          en: null,
        });
      } catch (e) {
        error = e;
      }

      expect(error).toEqual([
        {
          lang: 'en',
          code: 'required',
          message: 'a string is required',
          origin: null,
        },
      ]);
    });
  });

  describe('other', () => {
    it('list option to true makes validator treat each language as a list of strings', () => {
      const validate = multilingual({
        list: true,
      });

      const clean = validate({
        en: [],
        fr: ['Texte en français'],
        es: ['Una pequena palabra'],
      });

      expect(clean).toEqual({
        en: [],
        fr: ['Texte en français'],
        es: ['Una pequena palabra'],
      });
    });

    it('list something something with the default value', () => {
      const validate = multilingual({
        list: true,
      });

      const clean = validate(['un', 'deux', 'trois']);

      expect(clean).toEqual({ en: ['un', 'deux', 'trois'] });
    });

    it('default value can be null', () => {
      const validate = multilingual({
        default: null,
      });

      expect(validate()).toBeNull();
    });

    it('uppercase lang codes are converted to lowercase by default', () => {
      const validate = multilingual();

      const clean = validate({ FR: "Vous aimez? C'est français." });

      expect(Object.keys(clean)[0]).toBe('fr');
    });

    it('malformed language codes throw a validation error', () => {
      const validate = multilingual();

      let error;
      try {
        validate({
          '"fr"': "Ceci n'est pas une langue",
        });
      } catch (e) {
        error = e?.[0];
      }

      expect(error).toEqual({
        origin: '"fr"',
        code: 'lang.invalid',
        message: 'lang code should be 2 [a-z] characters',
        values: { min: 2, max: 2 },
      });
    });

    it('corresponding default language value is used when available', () => {
      const validate = multilingual({
        type: 'multilingual',
        default: { fr: 'Une desc', en: 'A desc' },
        languages: ['fr'],
      });

      expect(validate()).toEqual({ fr: 'Une desc' });
    });

    it('corresponding default value is used for any language when provided as string', () => {
      const validate = multilingual({
        type: 'multilingual',
        default: 'Une desc',
        languages: ['fr'],
      });

      expect(validate()).toEqual({ fr: 'Une desc' });
    });

    it('null or undefined keyed value filtered out', () => {
      const validate = multilingual();

      let clean = false;

      let errors = [];

      try {
        clean = validate({
          en: null,
          fr: 'Le texte anglais est franchement nul.',
        });
      } catch (e) {
        errors = e;
      }

      expect(errors.length).toBe(0);

      expect(clean).toEqual({
        fr: 'Le texte anglais est franchement nul.',
      });
    });
  });
});
