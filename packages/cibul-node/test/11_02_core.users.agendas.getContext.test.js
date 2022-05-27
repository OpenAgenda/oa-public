'use strict';

const Core = require('../core');
const Services = require('../services/init');
const loadFixtures = require('./fixtures/load');

const testConfig = require('./testConfig');

describe('11 - core - functional (server): core.users().agendas.events.getContext', () => {
  let core;

  beforeAll(() => loadFixtures(testConfig.db, '017.sql'));

  beforeAll(async () => {
    const services = await Services(testConfig, {
      enabled: [
        'knex',
        'redis',
        'simpleCache',
        'accessTokens',
        'files',
        'queues',
        'events',
        'agendas',
        'agendaEvents',
        'agendaLocations',
        'formSchemas',
        'custom',
        'eventSearch',
        'agendaSearch',
        'members',
        'networks',
        'legacy',
        'users',
        'keys',
        'trackers'
      ]
    });

    core = Core(services, testConfig);
  });

  afterAll(() => core.services.shutdown({ clear: true }));

  describe('event context', () => {
    describe('created event', () => {
      let context;

      beforeAll(async () => {
        context = await core.users(63170203).agendas(17026855).events(19390293).getContext({
          userUid: 1
        });
      });

      it('context provides authorizations', () => {
        expect(context.me.authorizations).toEqual({
          canRead: true,
          mustBeModerated: false,
          canChangeState: false,
          canPublish: false,
          canEditEvent: true,
          canCreateEvent: true,
          canContribute: true
        });
      });

      it('context provides contributing member details', () => {
        expect(context.member.userUid).toEqual(63170203);
      });

      it('context provides requesting user identifier and role', () => {
        expect(context.me.member.userUid).toEqual(63170203);
        expect(context.me.member.role).toEqual('contributor');
      });

      it('includes option can be used to fetch limited information', async () => {
        const sample = await core.users(63170203).agendas(17026855).events(19390293).getContext({
          userUid: 1,
          includes: 'me.authorizations'
        });
        expect(Object.keys(sample)).toEqual(['me']);
        expect(Object.keys(sample.me)).toEqual(['authorizations']);
      });
    });

    describe('draft event', () => {
      let context;
  
      beforeAll(async () => {
        context = await core.users(63170203).agendas(17026855).events(83902931).getContext({
          userUid: 1
        });
      });
  
      it('context of draft event is accessible', () => {
        expect(context.me.authorizations.canEditEvent).toBe(true);
      });
    });
  });

  describe('agenda context', () => {
    let context;

    beforeAll(async () => {
      context = await core.users(63170203).agendas(17026855).getContext({
        userUid: 63170203
      });
    });

    it('context provides authorizations', () => {
      expect(context.me.authorizations).toEqual({
        canRead: false,
        mustBeModerated: false,
        canChangeState: false,
        canPublish: false,
        canEditEvent: false,
        canCreateEvent: true,
        canContribute: true
      });
    });

    it('context provides member information', () => {
      expect(
        Object.keys(context.me.member).sort()
      ).toEqual([
        'deletedUser',
        'email',
        'name',
        'organization',
        'phone',
        'position',
        'role',
        'updatedAt',
        'userUid'
      ]);
    });
  });
});
