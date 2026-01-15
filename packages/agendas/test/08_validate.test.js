import validate from '../service/validate/index.js';
import publicValidate from '../service/validate/public.js';

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
