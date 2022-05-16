const validators = require('../src');

describe('choice validator', () => {
  describe('basic usage', () => {
    const validate = validators.choice({
      options: [2, 4, 13, 12]
    });

    it('is optional by default', () => {
      expect(validate()).toEqual([]);
    });

    it('keeps known values in clean result', () => {
      expect(validate([1, 2, 3])).toEqual([2]);
    });

    it('single value is handled as 1 value array', () => {
      expect(validate(2)).toEqual([2]);
    });

    it('validator is of type "choice"', () => {
      expect(validate.type).toBe('choice');
    });

    it('required with default given empty array throws error', () => {
      let errors;

      const validateChoice = validators.choice({
        options: [2, 4, 14],
        default: [2],
        optional: false
      });

      try {
        validateChoice([]);
      } catch (e) {
        errors = e;
      }

      expect(errors[0].code).toBe('choice.required');
    });
  });

  describe('still pretty basic usage', () => {
    const validateChoice = validators.choice({
      options: [2, 4, 12, 13],
      optional: false,
      key: 'id'
    });

    it('cleans keyed values', () => {
      expect(validateChoice([{
        id: 2,
        label: 'two'
      }, {
        id: 12,
        value: 'twelve'
      }])).toEqual([2, 12]);
    });

    it('throws error on empty input if not optional', () => {
      let errors = [];

      try {
        validateChoice(3);
      } catch (e) {
        errors = e;
      }

      expect(errors).toEqual([{
        code: 'choice.required',
        message: 'a (known) value must be chosen',
        origin: 3
      }]);
    });

    it('default value can be specified', () => {
      const validate = validators.choice({
        options: [2, 4, 12, 13],
        optional: false,
        key: 'id',
        default: [2]
      });

      const clean = validate();

      expect(clean).toEqual([2]);
    });

    it('unique option outputs clean unique value', () => {
      const validate = validators.choice({
        options: [2, 4],
        unique: true
      });

      const clean = validate(2);

      expect(clean).toBe(2);
    });

    it('default unique output is undefined by default', () => {
      const validate = validators.choice({
        options: [2, 4],
        unique: true
      });

      const clean = validate();

      expect(clean).toBeUndefined();
    });

    it('default unique output can be specified', () => {
      const validate = validators.choice({
        options: [22, 44],
        default: 22,
        unique: true
      });

      const clean = validate();

      expect(clean).toBe(22);
    });
  });

  describe('fielded', () => {
    const validate = validators.choice({
      options: [2, 4, 12, 13],
      field: 'etpaf',
      optional: false
    });

    it('when field value is set, it comes out in error', () => {
      let errors = [];

      try {
        validate();
      } catch (e) { errors = e; }

      expect(errors[0].field).toBe('etpaf');
    });
  });

  describe('restrict input to a predefined number of choices', () => {
    const validate = validators.choice({
      options: [2, 4, 12, 13],
      min: 2,
      max: 3
    });

    it('being below min throws error', () => {
      let errors = [];

      try {
        validate(2);
      } catch (e) { errors = e; }

      expect(errors).toEqual([{
        code: 'choice.required.min',
        message: 'between %min% and %max% choices must be made',
        values: { min: 2, max: 3 },
        origin: 2
      }]);
    });

    it('being above max throws error', () => {
      let errors = [];

      try {
        validate([2, 4, 12, 13]);
      } catch (e) { errors = e; }

      expect(errors).toEqual([{
        code: 'choice.required.max',
        message: 'between %min% and %max% choices must be made',
        values: { min: 2, max: 3 },
        origin: [2, 4, 12, 13]
      }]);
    });

    it('if provided default is non array and choice is non unique, returned default is array', () => {
      const validateChoice = validators.choice({
        options: [1, 2, 3],
        default: 2
      });

      const clean = validateChoice();

      expect(clean).toEqual([2]);
    });

    it('null given to optional choice returns null', () => {
      const validateChoice = validators.choice({
        unique: true,
        optional: true,
        options: [2, 3],
        default: 2,
        allowNull: true
      });

      const clean = validateChoice(null);

      expect(clean).toBeNull();
    });
  });
});
