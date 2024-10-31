import formatEventErrors from '../core/agendas/utils/formatEventErrors.js';

describe('formatEventErrors', () => {
  test('provides field and message in user language ready for form to display', () => {
    const errors = formatEventErrors(
      [
        {
          field: 'image',
          code: 'format.unknown',
          message: 'provided format is unknown',
        },
      ],
      'fr',
    );

    expect(errors).toEqual([
      {
        field: 'image',
        code: 'format.unknown',
        message: 'provided format is unknown',
        fieldLabel: "Image de l'événement",
        label: "Le format de l'image est inconnu",
      },
    ]);
  });
});
