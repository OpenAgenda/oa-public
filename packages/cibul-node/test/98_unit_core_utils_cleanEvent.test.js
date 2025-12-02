import validateEvent from '../core/agendas/utils/cleanEvent/validateEvent.js';

describe('98 - core unit - cleanEvent', () => {
  describe('validateEvent', () => {
    test('fix: consolidated validator properly validates event links data', () => {
      const result = validateEvent(
        {
          formSchema: { fields: [] },
          validateAgendaEvent: () => ({ state: 1 }),
        },
        {
          links: [{ link: 'https://openagenda.com' }],
        },
        {
          validateAsDraft: true,
          storedData: {
            uid: 18992812,
          },
          access: 'internal',
        },
      );

      expect(result.event.links).toEqual([{ link: 'https://openagenda.com' }]);
    });

    test('Event can be explicitly excluded from validation, but must be passed to validate other values as they could be linked to event data', () => {
      const result = validateEvent(
        {
          formSchema: {
            fields: [
              {
                field: 'image_alt_text',
                label: "Texte alternatif à l'image",
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
          isPatch: true,
          storedData: {
            uid: 18992812,
            title: { fr: 'Un titre' },
            description: { fr: 'Une description' },
            attendanceMode: 2,
            onlineAccessLink: 'https://event.com',
            image: {
              filename: 'an-image.jpg',
            },
            timings: [
              {
                begin: new Date('2025-12-01T10:00:00'),
                end: new Date('2025-12-01T11:00:00'),
              },
            ],
          },
          access: 'contributor',
        },
      );
      expect(result.custom.image_alt_text).toBe('Un texte');
    });

    test('if validation is done without stored data provided and additional field linked to event field is specified, it is not included in clean data', () => {
      const result = validateEvent(
        {
          formSchema: {
            fields: [
              {
                field: 'image_alt_text',
                label: "Texte alternatif à l'image",
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
          validateAsDraft: true,
          access: 'contributor',
        },
      );

      expect(result.custom.image_alt_text).toBeNull();
    });
  });
});
