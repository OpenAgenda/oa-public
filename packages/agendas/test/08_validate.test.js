'use strict';

const validate = require('../service/validate');
const publicValidate = require('../service/validate/public');

describe('agendas - unit (server): validate', () => {
  describe('public validator', () => {
    it('validates exposable agenda data', () => {
      let errors = [];
      let clean;

      const data = {
        title: 'Title of the agenda',
        description: 'Description of the agenda',
        slug: 'title-of-the-agenda',
        createdAt: new Date(),
      };

      try {
        clean = publicValidate(data);
      } catch (e) {
        errors = e;
      }

      expect(clean.title).toBe('Title of the agenda');
      expect(clean.description).toBe('Description of the agenda');
      expect(clean.slug).toBe('title-of-the-agenda');

      expect(clean.createdAt).toBeUndefined();

      expect(errors.length).toBe(0);
    });

    it('validate configured translation', () => {
      let errors = [];
      let clean;

      const data = {
        title: 'Title of the agenda',
        description: 'Description of the agenda',
        slug: 'title-of-the-agenda',
        settings: {
          inbox: {
            mailto: {
              enabled: false,
              email: null,
              subject: null,
              body: null,
            },
          },
          translation: {
            enabled: true,
            source: 'en',
            sets: [
              {
                source: 'fr',
                target: ['en', 'de'],
                checked: [],
              },
              {
                source: 'en',
                target: ['fr', 'it'],
                checked: ['fr', 'it'],
              },
            ],
          },
        },
      };

      try {
        clean = publicValidate(data);
      } catch (e) {
        errors = e;
      }

      expect(errors.length).toBe(0);

      expect(clean.settings.translation).toEqual({
        enabled: true,
        source: 'en',
        options: null,
        service: 'reverso',
        sets: [
          {
            source: 'fr',
            target: ['en', 'de'],
            checked: [],
          },
          {
            source: 'en',
            target: ['fr', 'it'],
            checked: ['fr', 'it'],
          },
        ],
      });
    });
  });

  describe('complete validator', () => {
    it('validates data', () => {
      let clean;
      let errors = [];

      const now = new Date();

      try {
        clean = validate({
          uid: 122312,
          ownerId: 1,
          title: 'La gargouille',
          slug: 'la-gargouille',
          description: 'Un agenda de tests',
          updatedAt: now,
          createdAt: now,
        });
      } catch (e) {
        errors = e;
      }

      expect(errors.length).toBe(0);

      expect(clean.title).toBe('La gargouille');
      expect(clean.createdAt.getTime()).toBe(now.getTime());
    });

    it('validates registration passCulture data', () => {
      let clean;
      let errors = [];

      const now = new Date();

      try {
        clean = validate({
          uid: 122312,
          ownerId: 1,
          title: 'La gargouille',
          slug: 'la-gargouille',
          description: 'Un agenda de tests',
          updatedAt: now,
          createdAt: now,
          settings: {
            registration: {
              passCulture: {
                siren: ['123456789', '987654321'],
              },
            },
          },
        });
      } catch (e) {
        errors = e;
      }
      expect(errors.length).toBe(0);
      expect(clean.settings.registration.passCulture.siren).toEqual([
        '123456789',
        '987654321',
      ]);
    });
  });
});
