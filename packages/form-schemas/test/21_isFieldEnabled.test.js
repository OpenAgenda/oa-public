import isFieldEnabled from '../client/src/lib/isFieldEnabled.js';

describe('isFieldEnabled', () => {
  it('if enableWith specifies value and value is in form values, returns true', () => {
    const enabled = isFieldEnabled(
      {
        label: 'Write in that',
        field: 'textfield',
        fieldType: 'text',
        enableWith: {
          field: 'checkboxes',
          value: 2,
        },
        related: ['checkboxes'],
      },
      {
        checkboxes: [2],
      },
    );

    expect(enabled).toBe(true);
  });

  it('if enableWith specifies value and value is not in form values, returns false', () => {
    const enabled = isFieldEnabled(
      {
        label: 'Write in that',
        field: 'textfield',
        fieldType: 'text',
        enableWith: {
          field: 'checkboxes',
          value: 2,
        },
      },
      {
        checkboxes: [1],
      },
    );

    expect(enabled).toBe(false);
  });

  it('enableWith with multiple values works as logical OR', () => {
    const enabled = isFieldEnabled(
      {
        field: 'textfield',
        enableWith: {
          field: 'radios',
          value: [1, 3],
        },
        min: null,
        max: null,
        fieldType: 'text',
      },
      {
        radios: 1,
      },
      false,
    );

    expect(enabled).toBe(true);
  });

  it('enableWith with field of file type must also evaluate filename', () => {
    const enabled = isFieldEnabled(
      {
        field: 'imageCredits',
        enableWith: 'image',
      },
      {
        image: { filename: null },
      },
    );

    expect(enabled).toBe(false);
  });

  describe('enableWith targets a field that is an object with multiple sub keys, only the specified key is evaluated', () => {
    describe('single', () => {
      const field = {
        field: 'castleDescription',
        enableWith: {
          field: 'location',
          value: { uid: 123 },
        },
      };
      it('not enabled if related value is different', () => {
        expect(
          isFieldEnabled(field, {
            location: { uid: 456 },
          }),
        ).toBe(false);
      });

      it('not enabled if related value is not defined', () => {
        expect(isFieldEnabled(field, {})).toBe(false);
        expect(isFieldEnabled(field, { location: null })).toBe(false);
      });

      it('enabled if targetted sub-value is the same', () => {
        expect(
          isFieldEnabled(field, {
            location: { uid: 123, name: 'The right place' },
          }),
        ).toBe(true);
      });
    });

    describe('multi', () => {
      const field = {
        field: 'castleDescription',
        enableWith: {
          field: 'location',
          value: [{ uid: 123 }, { uid: 789 }],
        },
      };
      it('not enabled if related value is different', () => {
        expect(
          isFieldEnabled(field, {
            location: { uid: 456 },
          }),
        ).toBe(false);
      });

      it('not enabled if related value is not defined', () => {
        expect(isFieldEnabled(field, {})).toBe(false);
        expect(isFieldEnabled(field, { location: null })).toBe(false);
      });

      it('enabled if targetted sub-value matches one of the defined values of the evaluated field', () => {
        expect(
          isFieldEnabled(field, {
            location: { name: 'The right place', uid: 123 },
          }),
        ).toBe(true);
      });
    });
  });
});
