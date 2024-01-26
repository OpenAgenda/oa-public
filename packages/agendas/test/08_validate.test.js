'use strict';

const assert = require('assert');

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
      } catch(e) {
        errors = e;
      }

      assert.strictEqual(clean.title, 'Title of the agenda');
      assert.strictEqual(clean.description, 'Description of the agenda');
      assert.strictEqual(clean.slug, 'title-of-the-agenda');

      assert.strictEqual(clean.createdAt, undefined);

      assert.equal(errors.length, 0);
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
              body: null
            }
          },
          translation: {
            enabled: true,
            source: 'en',
            sets: [{
              source: 'fr',
              target: ['en', 'de'],
              checked: []
            }, {
              source: 'en',
              target: ['fr', 'it'],
              checked: ['fr', 'it']
            }]
          }
        }
      };

      try {
        clean = publicValidate(data);
      } catch(e) {
        errors = e;
      }

      assert.strictEqual(errors.length, 0);

      assert.deepStrictEqual(clean.settings.translation, {
        enabled: true,
        source: 'en',
        options: null,
        service: 'reverso',
        sets: [{
          source: 'fr',
          target: ['en', 'de'],
          checked: []
        }, {
          source: 'en',
          target: ['fr', 'it'],
          checked: ['fr', 'it']
        }]
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
          createdAt: now
        });
      } catch(e) {
        errors = e;
      }

      assert.strictEqual(errors.length, 0);

      assert.strictEqual(clean.title, 'La gargouille');
      assert.strictEqual(clean.createdAt.getTime(), now.getTime());
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
              }
            }
          }
        });
      } catch(e) {
        errors = e;
      }
      assert.strictEqual(errors.length, 0);
      assert.deepEqual(clean.settings.registration.passCulture.siren, ['123456789', '987654321']);
    });
  });
});
