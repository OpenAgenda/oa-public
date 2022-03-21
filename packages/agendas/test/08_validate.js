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
        slug: 'title-of-the-agenda'
      };

      try {
        clean = publicValidate(data);
      } catch(e) {
        errors = e;
      }

      assert.equal(errors.length, 0);

      assert.deepStrictEqual(clean, {
        title: 'Title of the agenda',
        description: 'Description of the agenda',
        slug: 'title-of-the-agenda',
        official: false,
        networkUid: null,
        locationSetUid: null,
        settings: {
          lab: {
            eventAdmin: true,
            status: false
          },
          inbox: {
            mailto: {
              enabled: false,
              email: null,
              subject: null,
              body: null
            }
          },
          tracking: {
            googleAnalytics: null
          },
          contribution: {
            allowLocationCreate: true,
            defaultLang: null,
            defaultState: 2,
            messages: {
              instructions: null,
              complete: null,
              publication: null
            },
            type: 1,
            moderateOnChangeBy: [],
            useFields: false,
            authorizedIPAddresses: [],
            canPublish: ['administrators', 'moderators']
          },
          translation: {
            enabled: false,
            sets: [],
            options: null,
            service: 'reverso',
            source: 'fr'
          }
        },
        url: undefined
      });
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

      assert.deepStrictEqual(clean, {
        title: 'La gargouille',
        slug: 'la-gargouille',
        uid: 122312,
        official: false,
        officializedAt: null,
        private: false,
        indexed: true,
        ownerId: 1,
        formSchemaId: null,
        networkUid: null,
        locationSetUid: null,
        settings: {
          lab: {
            eventAdmin: true,
            status: false
          },
          tracking: {
            googleAnalytics: null
          },
          inbox: {
            mailto: {
              enabled: false,
              email: null,
              subject: null,
              body: null
            }
          },
          contribution: {
            allowLocationCreate: true,
            defaultLang: null,
            defaultState: 2,
            messages: {
              instructions: null,
              complete: null,
              publication: null
            },
            type: 1,
            useFields: false,
            authorizedIPAddresses: [],
            canPublish: ['administrators', 'moderators'],
            moderateOnChangeBy: []
          },
          translation: {
            enabled: false,
            sets: [],
            options: null,
            service: 'reverso',
            source: 'fr'
          }
        },
        updatedAt: now,
        createdAt: now,
        description: 'Un agenda de tests',
        image: null,
        url: undefined,
        credentials: {
          useContributeApp: true,
          useAgendaSchema: true,
          premiumCustomFields: false,
          activatingInvitations: false,
          emailstrategie: false,
          indesign: false,
          invitationMessage: false,
          calendarView: false,
          moderators: false,
          tags: false,
          embedsHead: true,
          embedsTemplates: true,
          prioritizedAggregator: false,
          aggregator: false,
          docxExport: false,
          eventOwnershipTransfer: false,
          graphs: false,
          useJSONBridge: false
        }
      });
    });
  });
});
