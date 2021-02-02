'use strict';

const assert = require('assert');

const Files = require('@openagenda/files');
const {
  service: config,
  dependencies: dConfig,
} = require('../testconfig.sample');

const fixtures = require('./fixtures');
const Service = require('..');
const initSettings = require('./fixtures/agendaTestSettings');
const initSettingsP = {...initSettings, access: {
  create: false,
  delete: false,
  merge: true,
  update: true
}}

describe('agenda-locations - functional - settings get', function() {
  this.timeout(10000);


  const f = fixtures(config.mysql);

  let svc;
  let settings;

  before(async () => {
    await f.load();

    svc = Service({
      knex: f.client,
      Files: Files(dConfig.files),
      interfaces: {
        getAgendaLocationSettings: async (uid) =>
        uid % 2 === 0 ? initSettings : initSettingsP 
      },
    });
    
  });


  it('settings.access is not default if retrieved', async() => {
    settings = await svc(5).settings.get();
    
    assert.deepEqual(settings.access, {
      create : false,
      delete: false,
      merge: true,
      update: true,
    })
  });

  it('settings.access is default if not retrieved', async() => {
    settings = await svc(10).settings.get();
    
    assert.deepEqual(settings.access, {
      create : true,
      delete: true,
      merge: true,
      update: true,
    })
  });

  it('settings.eventForm is not default', async() => {
    settings = await svc(5).settings.get();
    
    assert.deepEqual(settings.eventForm.detailed, true)
  });

  it('languages in tagSet are not flattened when lang is not passed in options', async() => {
    settings = await svc(10).settings.get();
    
    assert.deepEqual(settings.tagSet.groups.find(e => e.name === 'Types de lieu')
      .tags.filter(e => e.id === 21 || e.id === 22),
      [
        { id: 21, label: { fr: 'Insolites', en: 'Unusual' } },
        { id: 22, label: { fr: 'Société et civilisation', en: 'Society and civilization' }}
      ]
    )
  });

  it('languages in tagSet are flattened when lang is passed in options', async() => {
    settings = await svc(10).settings.get({ lang: 'fr' });
    assert.deepEqual(settings.tagSet.groups.find(e => e.name === 'Types de lieu')
      .tags.filter(e => e.id === 21 || e.id === 22),
      [
        { id: 21, label: 'Insolites' },
        { id: 22, label: 'Société et civilisation' }
      ]
    )
  });

  it('bySet all is default', async() => {
    settings = await svc.sets(5).settings.get();

    assert.deepEqual(settings, {
      eventForm: {
        detailed: false
      },
      labels: {},
      tagSet: {
        groups: []
      },
      access: {
        create: true,
        delete: true,
        merge: true,
        update: true
      }
    })
  });
})

    // ça
    // settings = await svc(5).settings.get();
    // c'est pareil que ça:
    // settings = await svc.agendas(agendaUID).settings.get();

    // ça doit aller chercher les settings via l'interface.

    // Après, on va inclure les settings définits dans un jeu de lieux.
    // settings = await svc.set(1).settings.get();