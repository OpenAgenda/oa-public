import ih from 'immutability-helper';
import knex from 'knex';
import Service from '../index.js';
import config from '../testconfig.js';
import fixtures from './fixtures/index.js';

describe('agendaEvents - 04 - functional (server): update', () => {
  let svc;
  let knexClient;

  beforeAll(async () => {
    await fixtures(config.mysql, [
      'reset.sql',
      '../../model.sql',
      'agenda_event.data.sql',
    ]);
  });

  beforeAll(async () => {
    knexClient = knex({
      client: 'mysql2',
      connection: config.mysql,
    });
  });

  beforeAll(() => {
    svc = Service({
      ...config,
      knex: knexClient,
    });
  });

  afterAll(() => knexClient.destroy());

  describe('simple update', () => {
    let result;

    beforeAll(async () => {
      result = await svc(62792452).update(10974548, {
        featured: true,
        state: 2,
        aggregated: 'fdqfdsq',
      });
    });

    it('result provides success boolean', () => {
      expect(result.success).toBe(true);
    });

    it('result provides updated value', () => {
      expect(result.updated.featured).toBe(true);
      expect(result.updated.state).toBe(2);
    });

    it('result provides value prior to update in before key', () => {
      expect(result.before.featured).toBe(false);
      expect(result.before.state).toBe(1);
    });

    it('aggregated value is not directly updatable', () => {
      expect(result.updated.aggregated).toBe('achecksumvalue');
    });
  });

  describe('handling protected values', () => {
    let protectedRef;
    let unprotectedRef;

    const forcedDate = new Date('2018-02-28T08:00:00.000Z');

    beforeAll(async () => {
      await svc(1).create(11, { userUid: 1 });
      await svc(1).create(12, { userUid: 2 });
    });

    beforeAll(async () => {
      await svc(1).update(11, {
        userUid: 3,
        createdAt: forcedDate,
      });

      await svc(1).update(
        12,
        {
          userUid: 3,
          createdAt: forcedDate,
        },
        { protected: false },
      );

      protectedRef = await svc(1).get(11);

      unprotectedRef = await svc(1).get(12);
    });

    it('protected ref userUid is unchanged', async () => {
      expect(protectedRef.userUid).toBe(1);
    });

    it('protected ref createdAt timestamp is unchanged', async () => {
      expect(protectedRef.createdAt).not.toEqual(forcedDate);
    });

    it('unprotected ref userUid is changed', async () => {
      expect(unprotectedRef.userUid).toBe(3);
    });

    it('unprotected ref createdAt timestamp is changed', async () => {
      expect(unprotectedRef.createdAt).toEqual(forcedDate);
    });
  });

  describe('other', () => {
    it('cleans state given as string', async () => {
      const result = await svc(62792452).update(10974548, {
        featured: true,
        state: '1',
      });

      expect(result.updated.state).toBe(1);
    });

    it('simple update to refused state', async () => {
      const result = await svc(62792452).update(10974548, {
        state: -1,
      });

      expect(result.updated.state).toBe(-1);
    });

    it('updated of aggregated key is done through options', async () => {
      const result = await svc(62792452).update(
        10974548,
        {},
        {
          aggregated: 'updatedchecksum',
        },
      );

      expect(result.updated.aggregated).toBe('updatedchecksum');
    });

    it('simple update to canEdit set to true', async () => {
      const result = await svc(62792452).update(10974548, {
        canEdit: true,
      });

      expect(result.updated.canEdit).toBe(true);
    });

    it('update is part update', async () => {
      await svc(62792452).update(10974548, {
        canEdit: true,
      });

      const result = await svc(62792452).update(10974548, {
        state: -1,
      });

      expect(result.updated.canEdit).toBe(true);
    });

    it('update on sourcePaths field replaces previous list', async () => {
      const result = await svc(62792452).update(60059313, {
        sourcePaths: [88, [11]],
      });

      expect(result.updated.sourcePaths).toEqual([88, [11]]);
    });

    it('update without state does not change current state', async () => {
      await svc(62792452).update(10974548, {
        state: -1,
      });

      const result = await svc(62792452).update(10974548, {});

      expect(result.updated.state).toBe(-1);
    });

    it('context can be passed in options to be transfered to onUpdate interface', () =>
      new Promise((rs) => {
        const otherSvc = Service(
          ih(config, {
            interfaces: {
              onUpdate: {
                $set: (before, after, context) => {
                  expect(context.userUid).toBe(111);
                  rs();
                },
              },
            },
          }),
        );

        otherSvc(62792452).update(
          10974548,
          { featured: true },
          {
            context: {
              userUid: 111,
              aggregated: false,
              sourceAgenda: null,
              agenda: null,
              event: null,
            },
          },
        );
      }));

    it('update ref to refuse and set motive', async () => {
      const result = await svc(62792452).update(10974548, {
        state: -1,
        motive: 'Tsk tsk',
      });

      expect(result.updated.motive).toBe('Tsk tsk');
      const row = await knexClient('agenda_event').first().where({
        agenda_uid: 62792452,
        event_uid: 10974548,
      });

      expect(row.motive).toBe('Tsk tsk');
    });
  });
});
