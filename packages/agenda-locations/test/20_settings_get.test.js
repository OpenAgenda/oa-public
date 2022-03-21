'use strict';

const _ = require('lodash');

const Files = require('@openagenda/files');
const {
  service: config,
  dependencies: dConfig,
} = require('../testconfig.sample');

const Service = require('..');
const fixtures = require('./fixtures');
const initSettings = require('./fixtures/agendaTestSettings');

const defaultAccess = {
  authorized: true,
  external: false,
  serviceLabel: null,
  link: null
};

const initSettingsP = {
  ...initSettings,
  access: {
    create: { ...defaultAccess, authorized: false },
    delete: { ...defaultAccess, authorized: false },
    merge: defaultAccess,
    update: defaultAccess
  }
};

describe('agenda-locations - functional - settings get', () => {
  const f = fixtures(config.mysql);

  let svc;

  describe('location set without settings', () => {
    beforeAll(async () => {
      await f.load();

      svc = Service({
        knex: f.client,
        Files: Files(dConfig.files),
        interfaces: {
          getAgendaLocationSettings: async uid => ({
            5: initSettingsP,
            10: null
          })[uid],
          getAgendaDetailsByUid: async () => null
        },
      });
    });

    it('settings.access is not default if retrieved', async () => {
      const settings = await svc(5).settings.get();

      expect(settings.access).toStrictEqual({
        create: { ...defaultAccess, authorized: false },
        delete: { ...defaultAccess, authorized: false },
        merge: defaultAccess,
        update: defaultAccess,
      });
    });

    it('settings.access is default if not retrieved', async () => {
      const settings = await svc(10).settings.get();
      expect(settings.access).toStrictEqual({
        create: defaultAccess,
        delete: defaultAccess,
        merge: defaultAccess,
        update: defaultAccess,
      });
    });

    it('settings.eventForm is not default', async () => {
      const settings = await svc(5).settings.get();
      expect(settings.eventForm.detailed).toBeTruthy();
    });

    it('setUid with no settings in database, returns default values', async () => {
      const settings = await svc.sets(5).settings.get();

      expect(settings).toStrictEqual({
        eventForm: {
          detailed: false
        },
        labels: {},
        tagSet: {
          groups: []
        },
        access: {
          create: defaultAccess,
          delete: defaultAccess,
          merge: defaultAccess,
          update: defaultAccess
        }
      });
    });
  });

  describe('location set with settings', () => {
    beforeAll(async () => {
      await f.load();

      await f.client('location_set').where('uid', 1903810).update({
        settings: JSON.stringify({
          eventForm: {
            detailed: false,
          },
          access: {
            create: { ...defaultAccess, authorized: false },
            delete: { ...defaultAccess, authorized: false },
            merge: { ...defaultAccess, authorized: false },
            update: defaultAccess
          }
        })
      });

      svc = Service({
        knex: f.client,
        Files: Files(dConfig.files),
        interfaces: {
          getAgendaLocationSettings: async uid => ({
            5: initSettingsP,
            10: initSettings,
            11: null
          })[uid],
          getAgendaDetailsByUid: async (_uid, _fields) => ({
            locationSetUid: 1903810
          }),
          getSetAgendasCount: async _setUid => 14,
        },
      });
    });

    describe('settings are fetched from agenda endpoint and agenda is linked to a location set', () => {
      it(
        'when defined, values from the set override any value defined at the agenda level',
        async () => {
          const settings = await svc(10).settings.get();
          expect(settings.access).toStrictEqual({
            create: { ...defaultAccess, authorized: false },
            delete: { ...defaultAccess, authorized: false },
            merge: { ...defaultAccess, authorized: false },
            update: defaultAccess
          });
        }
      );

      it('when not defined at set level, values from agenda are used', async () => {
        const settings = await svc(10).settings.get();
        expect(settings.labels.translationInfo.fr).toEqual("C'est pour traduire automatiquement");
      });
    });

    it('setUid with settings in database, values are not default', async () => {
      const settings = await svc.sets(1903812).settings.get();
      expect(_.omit(settings, ['agendas'])).toStrictEqual({
        eventForm: {
          detailed: true
        },
        labels: {},
        tagSet: {
          groups: []
        },
        access: {
          create: { ...defaultAccess, authorized: false },
          delete: { ...defaultAccess, authorized: false },
          merge: { ...defaultAccess, authorized: false },
          update: defaultAccess
        }
      });
    });

    it('settings from set can contain an array of agenda-specific settings', async () => {
      const settings = await svc.sets(1903812).settings.get();
      expect(Array.isArray(settings.agendas)).toBeTruthy();
    });

    it('agenda specific settings default to general set settings when left unspecified', async () => {
      const settings = await svc.sets(1903812).settings.get();
      expect(settings.agendas[0].eventForm.detailed).toBeTruthy();
    });

    it('agenda-specific settings are provided if requested in set settings get', async () => {
      const settings = await svc.sets(1903812).settings.get({ agendaUid: 11 });
      expect(settings.access.update.authorized).toBeTruthy();
    });

    it('if agenda-specific settings are requested but not found, set settings are returned', async () => {
      const settings = await svc.sets(1903811).settings.get({
        agendaUid: 12
      });
      expect(settings.access.update.authorized).toBeFalsy();
    });

    it('using option getting set info aswell', async () => {
      const settings = await svc(11).settings.get({ includeSetInfo: true });
      expect(settings.set.agendasCount).toBeTruthy();
    });
  });

  describe('fromDbEntryToSettings', () => {
    beforeAll(async () => {
      await f.load();

      svc = Service({
        knex: f.client,
        Files: Files(dConfig.files),
        interfaces: {
          getAgendaLocationSettings: async _uid => ({
            ...initSettings,
            access: {
              create: false,
              delete: false,
              merge: true,
              update: false
            }
          }),
          getAgendaDetailsByUid: async (_uid, _fields) => ({
            locationSetUid: 1903810
          }),
        },
      });
    });

    it('settings.access is transformed into object if stored as boolean', async () => {
      const settings = await svc(5).settings.get();
      expect(settings.access).toStrictEqual({
        create: { ...defaultAccess, authorized: false },
        delete: { ...defaultAccess, authorized: false },
        merge: defaultAccess,
        update: { ...defaultAccess, authorized: false },
      });
    });

    it('languages in tagSet are not flattened if lang is not passed in options', async () => {
      const settings = await svc(10).settings.get();
      expect(settings.tagSet.groups.find(e => e.name === 'Types de lieu')
        .tags.filter(e => e.id === 21 || e.id === 22)).toStrictEqual([
        { id: 21, label: { fr: 'Insolites', en: 'Unusual' } },
        { id: 22, label: { fr: 'Société et civilisation', en: 'Society and civilization' } }
      ]);
    });

    it('languages in tagSet are flattened if lang is passed in options', async () => {
      const settings = await svc(10).settings.get({ lang: 'fr' });
      expect(settings.tagSet.groups.find(e => e.name === 'Types de lieu')
        .tags.filter(e => e.id === 21 || e.id === 22)).toStrictEqual([
        { id: 21, label: 'Insolites' },
        { id: 22, label: 'Société et civilisation' }
      ]);
    });
  });
  // add test for set info
});
