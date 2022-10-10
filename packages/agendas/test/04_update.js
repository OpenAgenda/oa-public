'use strict';

const {
  service: config,
  dependencies: dConfig
} = require('../testconfig.sample');

const mysql = require('mysql');
const assert = require('assert');
const Files = require('@openagenda/files');

const svc = require('../');

describe('agendas - functional (server): set (update)', function() {

  this.timeout(30000);

  before(require('./fixtures/load.js').bind(null, {
    mysql: config.mysql,
    files: [
      __dirname + '/fixtures/resetDb.sql',
      __dirname + '/../model.sql',
      __dirname + '/fixtures/agenda.data.sql',
      __dirname + '/fixtures/agendaEvent.data.sql',
      __dirname + '/fixtures/occurrence.data.sql'
   ],
    map: {
      database: config.mysql.database,
      agenda: 'agenda',
      agendaEvent: 'agenda_event',
      occurrence: 'occurrence',
      legacyCredential: 'legacy_credential_set'
    }
  }));

  before(() => svc.init({
    ...config,
    Files: Files(dConfig.files)
  }));

  afterEach(() => svc.init({
    ...config,
    Files: Files(dConfig.files)
  }));

  it('set returns a promise', async () => {
    const { agenda } = await svc.set(4875, {
      title: 'La promesse'
    });

    assert.strictEqual(agenda.title, 'La promesse');
  });

  it('set in promise mode can take options', async () => {
    const { agenda } = await svc.set(4875, {
      title: 'La 2ème promesse'
    }, { protected: false });

    assert.strictEqual(agenda.title, 'La 2ème promesse');
  });

  it('set sets a pre-exisiting agenda if identifier is given as first parameter', done => {
    svc.set(4875, {
      title: 'Le Frometon'
    }, (err, result) => {
      assert.strictEqual(err, null);

      assert.deepStrictEqual(result.agenda, {
        slug: 'programme-des-animations-du-salon-du-fromage-et-des-produits-laitiers-2016',
        uid: 52084961,
        title: 'Le Frometon',
        description: 'Des animations pour des expériences autour du goût et des savoir-faire / Numerous events to have experiences around taste and know-how',
        image: 'review_programme-des-animations-du-salon-du-fromage-et-des-produits-laitiers-2016_00.jpg',
        url: 'http://www.salon-fromage.com/',
        networkUid: null,
        settings: {
          lab: {
            status: true
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
              publication: null,
              GDPRInformation: null
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
        updatedAt: result.agenda.updatedAt,
        createdAt: result.agenda.createdAt,
        official: 0,
        private: 0,
        indexed: 1,
        locationSetUid: null
      });

      done();
    });
  });

  it('set by slug works too', done => {
    svc.set({ slug: 'programme-des-animations-du-salon-du-fromage-et-des-produits-laitiers-2016' }, {
      official: true
    }, { protected: false }, (err, result) => {
      assert.strictEqual(err, null);
      assert.strictEqual(result.agenda.official, 1);

      done();
    });
  });

  it('setting official timestamps offialized_at', done => {
    let now = new Date();

    svc.set(4875, {
      official: true
    }, { protected: false, internal: true }, (err, result) => {
      assert(result.agenda.officializedAt.getTime() - now.getTime() < 1000);

      done();
    });
  });

  it('set without internal option returns an updated agenda that excludes internal fields', done => {
    svc.set(4875, { title: 'Booyah' }, (err, result) => {
      assert.strictEqual(result.agenda.id, undefined);

      done();
    });
  });

  it('set with internal option set to true returns an updated agenda that includes internal fields', done => {
    svc.set(4875, { title: 'Boom.' }, { internal: true }, (err, result) => {
      assert.strictEqual(result.agenda.id, 4875);

      done();
    });
  });

  it('set with includeImagePath to true returns an updated agenda that includes image paths', done => {
    svc.set(4875, { title: 'Le mur' }, { includeImagePath: true }, (err, result) => {
      result.agenda.image.should.equal('//openagendatst.s3.amazonaws.com/review_programme-des-animations-du-salon-du-fromage-et-des-produits-laitiers-2016_00.jpg');

      done();
    });
  });

  it('set slug', done => {
    svc.set({ slug: 'programme-des-animations-du-salon-du-fromage-et-des-produits-laitiers-2016' }, {
      slug: 'lait'
    }, (err, result) => {
      assert.strictEqual(err, null);

      result.agenda.slug.should.equal('lait');

      done();
    });
  });

  it('set credentials on pre-exisiting agenda', done => {
    svc.set({ uid: 65903437 }, {
      credentials: {
        moderators: true
      }
    }, {
      internal: true, // to retrieve credentials after update
      protected: false
    }, (err, result) => {
      assert.strictEqual(err, null);

      assert.deepStrictEqual(result, {
        agenda: {
          id: 4887,
          ownerId: 7388,
          formSchemaId: null,
          memberSchemaId: null,
          networkUid: null,
          locationSetUid: null,
          slug: 'agenda-culturel-auvergne',
          uid: 65903437,
          official: 0,
          officializedAt: null,
          private: 0,
          indexed: 1,
          title: 'Agenda culturel Auvergne',
          description: 'test ! :)',
          url: '',
          image: null,
          settings: {
            lab: {
              status: true
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
                publication: null,
                GDPRInformation: null
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
          updatedAt: result.agenda.updatedAt,
          createdAt: result.agenda.createdAt,
          credentials: {
            useContributeApp: true,
            useAgendaSchema: true,
            premiumCustomFields: false,
            activatingInvitations: false,
            moderators: true,
            tags: false,
            embedsHead: true,
            embedsTemplates: true,
            indesign: false,
            aggregator: false,
            prioritizedAggregator: false,
            invitationMessage: false,
            calendarView: false,
            docxExport: false,
            eventOwnershipTransfer: false,
            graphs: false,
            useJSONBridge: false
          },
          legacyStore: {
            moderated: false,
            order: 'relative'
          }
        },
        valid: true,
        success: true,
        errors: []
      });

      done();
    });
  });

  it('empty moderateOnChangeBy keeped', done => {
    svc.set(
      { uid: 35338076 },
      {
        settings: {
          contribution: {
            moderateOnChangeBy: []
          }
        }
      }, {
        internal: true, // to retrieve credentials after update
        protected: false
      }, (err, result) => {
        assert.strictEqual(err, null);
        assert.deepStrictEqual(result.agenda.settings.contribution.moderateOnChangeBy, []);

        done();
      });
  });

  it('unprotected set cannot update protected field', done => {
    const uid = 65903437;

    svc.set({ uid }, {
      credentials: {
        moderators: true
      }
    }, { protected: false }, (err, result) => {
      svc.set({ uid }, {
        title: 'Nouveau titre',
        credentials: {}
      }, () => {
        svc.get({ uid }, { internal: true }, (err, data) => {
          assert(data.credentials.moderators);

          done();
        });
      });
    });
  });

  it('partial settings set does not impact remaining settings values', done => {
    let uid = 65903437;

    svc.set({ uid }, {
      settings: {
        translation: {
          enabled: true
        }
      }
    }, (err, result) => {
      svc.set({ uid }, {
        settings: {
          contribution: {
            defaultState: 1,
          }
        }
      }, (err, result) => {
        assert(result.agenda.settings.translation.enabled);

        done();
      });
    });
  });

  it('onUpdate callbacks with agenda data before and after update', done => {
    svc.init(Object.assign({}, config, {
      Files: Files(dConfig.files),
      interfaces: {
        onUpdate: (before, after) => {
          assert.strictEqual(before.settings.contribution.useFields, false);
          assert.strictEqual(after.settings.contribution.useFields, true);

          done();
        }
      }
    }));

    svc.set(4830, {
      settings: {
        contribution: {
          useFields: true
        }
      }
    }, () => {});
  });

  it('onUpdate callbacks with agenda data that includes internal fields', done => {
    svc.init(Object.assign({}, config, {
      Files: Files(dConfig.files),
      interfaces: {
        onUpdate: (before, after) => {
          assert.strictEqual(before.id, 4830);
          assert.strictEqual(after.id, 4830);

          done();
        }
      }
    }));

    svc.set(4830, {
      title: 'Blaaargh'
    }, () => {});
  });
});
