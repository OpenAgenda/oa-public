import Services from '../services/init.js';
import Core from '../core/index.js';
import loadFixtures from './fixtures/load.js';
import testConfig from './testConfig.js';

describe('core.agendas.members.sendGroupMail', () => {
  let core;
  let services;

  beforeAll(() => loadFixtures(testConfig.db, '021.sql.js'));

  beforeAll(async () => {
    services = await Services(testConfig, {
      enabled: [
        'bull',
        'knex',
        'redis',
        'simpleCache',
        'accessTokens',
        'files',
        'mails',
        'bull',
        'events',
        'agendas',
        'agendaEvents',
        'agendaLocations',
        'formSchemas',
        'custom',
        'eventSearch',
        'members',
        'networks',
        'users',
        'keys',
        'tracker',
      ],
    });

    core = Core(services, testConfig);

    await services.formSchemas.clearCache();

    services.members.sendGroupMail.task();
  });

  beforeAll(() => services.members.sendGroupMail.clear());

  afterAll(() => core.services.shutdown({ clear: true }));

  describe('send to all', () => {
    let tracked;
    beforeAll(
      () =>
        new Promise((rs) => {
          core.agendas(1904).members(111).sendGroupMail(
            {},
            {
              subject: 'Message subject',
              message: 'Message content',
            },
          );

          core.services.tracker.on(
            'members.sendGroupMail.successful',
            (received) => {
              tracked = received;
              rs();
            },
          );
        }),
    );

    afterAll(() => {
      services.tracker.flush();
    });

    test('by default, sender does not receive message', () => {
      expect(
        tracked.find((t) => t === 'members.sendGroupMail.chain.toMember:111'),
      ).toBeUndefined();
      expect(
        tracked.find((t) => t === 'members.sendGroupMail.chain.toSender'),
      ).toBeUndefined();
    });

    test('a mail is dispatched to all other members', () => {
      // ex: members.sendGroupMail.sentMessageTo:221,email@test.com,Subject of the email
      const recipientMemberUids = tracked
        .filter((t) => t.indexOf('members.sendGroupMail.sentMessageTo') === 0)
        .map((t) => parseInt(t.split(':').pop().split(',').shift(), 10));

      expect(recipientMemberUids).toEqual([222, 331, 332]);
    });
  });

  describe('send to contributors only and sender receives a copy', () => {
    let tracked;

    beforeAll(
      () =>
        new Promise((rs) => {
          core.agendas(1904).members(111).sendGroupMail(
            { role: 1 },
            {
              subject: 'Message subject',
              message: 'Message content',
              sendToMe: true,
            },
          );

          core.services.tracker.on(
            'members.sendGroupMail.successful',
            (received) => {
              tracked = received;
              rs();
            },
          );
        }),
    );

    afterAll(() => {
      services.tracker.flush();
    });

    test('only the contributors receive the message', () => {
      expect(
        tracked
          .filter(
            (t) => t.indexOf('members.sendGroupMail.chain.toMember') === 0,
          )
          .map((t) => parseInt(t.split(':')[1].split(',').shift(), 10)),
      ).toEqual([331, 332]);
    });

    test('...and the sender', () => {
      const toSenderTrack = tracked.filter(
        (t) => t.indexOf('members.sendGroupMail.chain.toSender') === 0,
      );

      expect(toSenderTrack.length).toBe(1);

      expect(parseInt(toSenderTrack[0].split(':').pop(), 10)).toBe(111);
    });
  });

  describe('send to inactive members only', () => {
    let tracked;

    beforeAll(
      () =>
        new Promise((rs) => {
          core.agendas(1904).members(111).sendGroupMail(
            { role: 1 },
            {
              subject: 'Message subject',
              message: 'Message content',
              inactive: true,
            },
          );

          core.services.tracker.on(
            'members.sendGroupMail.successful',
            (received) => {
              tracked = received;
              rs();
            },
          );
        }),
    );

    afterAll(() => {
      services.tracker.flush();
    });

    test('only members with action counter set to 0 receive the message', () => {
      // 332
      expect(
        tracked
          .filter((t) => t.indexOf('members.sendGroupMail.sentMessageTo') === 0)
          .map((t) => parseInt(t.split(':').pop().split(',').shift(), 10)),
      ).toEqual([332]);
    });
  });
});
