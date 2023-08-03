'use strict';

const {
  validateEvent,
} = require('../core/agendas/utils/cleanEvent');

describe('98 - core unit - cleanEvent', () => {
  describe('validateEvent', () => {
    test(
      'Event can be explicitly excluded from validation, but must be passed to validate other values as they could be linked to event data',
      () => {
        const result = validateEvent({
          formSchema: {
            fields: [
              {
                field: 'image_alt_text',
                label: 'Texte alternatif à l\'image',
                enableWith: 'image',
                related: ['image'],
                fieldType: 'text',
              },
            ],
          },
          validateAgendaEvent: () => ({ state: 1 }),
        }, {
          image_alt_text: 'Un texte',
        }, {
          validateWithStoredData: true,
          event: {
            uid: 18992812,
            image: {
              filename: 'an-image.jpg',
            },
          },
          access: 'contributor',
          partial: true,
        });
        expect(result.custom.image_alt_text).toBe('Un texte');
      },
    );

    test(
      'if validation is done without stored data provided and additional field linked to event field is specified, it is not included in clean data',
      () => {
        const result = validateEvent(
          {
            formSchema: {
              fields: [
                {
                  field: 'image_alt_text',
                  label: 'Texte alternatif à l\'image',
                  enableWith: 'image',
                  related: ['image'],
                  fieldType: 'text',
                },
              ],
            },
            validateAgendaEvent: () => ({ state: 1 }),
          },
          {
            image_alt_text: 'Un texte',
          },
          {
            validateWithStoredData: false,
            access: 'contributor',
            partial: true,
          },
        );

        expect(result.custom.image_alt_text).toBeNull();
      },
    );
  });
});
