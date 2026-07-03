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

    describe('draft default seeding', () => {
      // An agenda whose form schema pins attendanceMode to "online" (2). With
      // that default, `location` is optional (optionalWith attendanceMode 2).
      const onlineAgendaSchema = {
        fields: [{ field: 'attendanceMode', fieldType: 'abstract', default: 2 }],
      };

      test('seeds the agenda-configured default for a field the user left untouched', () => {
        // Without seeding, a draft saved with no attendanceMode falls back to the
        // `attendance_mode` column DEFAULT (1/offline), which then fails
        // `location.required` on publish. The cleaned data must carry the
        // agenda default (2) so the INSERT does not rely on the column default.
        const result = validateEvent(
          {
            formSchema: onlineAgendaSchema,
            validateAgendaEvent: () => ({ state: 1 }),
          },
          { title: { fr: 'Un titre' } },
          { validateAsDraft: true, access: 'contributor' },
        );

        expect(result.event.attendanceMode).toBe(2);
      });

      test('does not override an attendanceMode the user explicitly provided', () => {
        const result = validateEvent(
          {
            formSchema: onlineAgendaSchema,
            validateAgendaEvent: () => ({ state: 1 }),
          },
          { title: { fr: 'Un titre' }, attendanceMode: 1 },
          { validateAsDraft: true, access: 'contributor' },
        );

        expect(result.event.attendanceMode).toBe(1);
      });

      test('does not re-seed a field already set on the stored draft', () => {
        const result = validateEvent(
          {
            formSchema: onlineAgendaSchema,
            validateAgendaEvent: () => ({ state: 1 }),
          },
          { title: { fr: 'Nouveau titre' } },
          {
            validateAsDraft: true,
            isPatch: true,
            storedData: { uid: 18992812, attendanceMode: 3 },
            access: 'contributor',
          },
        );

        // The stored value is preserved (via the patch merge); seeding must not
        // replace it with the agenda default.
        expect(result.event.attendanceMode).toBe(3);
      });

      test('does not seed a write-restricted field (no spurious unauthorized error)', () => {
        // A custom field carrying both a default and a write restriction must be
        // skipped: seeding it would make it present in the input and trip the
        // field-level authorization check, failing the contributor's draft save.
        const result = validateEvent(
          {
            formSchema: {
              fields: [
                { field: 'attendanceMode', fieldType: 'abstract', default: 2 },
                {
                  field: 'restricted-field',
                  fieldType: 'text',
                  default: 'x',
                  write: ['administrator'],
                },
              ],
            },
            validateAgendaEvent: () => ({ state: 1 }),
          },
          { title: { fr: 'Un titre' } },
          { validateAsDraft: true, access: 'contributor' },
        );

        expect(result.custom['restricted-field']).toBeUndefined();
        // The unrestricted field is still seeded.
        expect(result.event.attendanceMode).toBe(2);
      });
    });
  });
});
