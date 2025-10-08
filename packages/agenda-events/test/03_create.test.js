import _ from 'lodash';
import knex from 'knex';
import ih from 'immutability-helper';
import mysql from 'mysql2';
import Service from '../index.js';
import config from '../testconfig.js';
import fixtures from './fixtures/index.js';

describe('agendaEvents - 03 - functional (server): create', () => {
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
      connection: { ...config.mysql },
    });
  });

  beforeAll(() => {
    svc = Service({
      ...config,
      knex: knexClient,
    });
  });

  afterAll(() => knexClient.destroy());

  describe('simple create', () => {
    let rows;
    let result;

    beforeAll(
      () =>
        new Promise((rs) => {
          svc(1111)
            .create(2222)
            .then((r1) => {
              result = r1;
              const con = mysql.createConnection(config.mysql);

              con.query(
                'select * from agenda_event where agenda_uid = ? and event_uid = ?',
                [1111, 2222],
                (err, r2) => {
                  rows = r2;
                  rs();
                },
              );
            });
        }),
    );

    it('one entry in db is created', () => {
      expect(rows.length).toBe(1);
    });

    it('entry has specified agenda and event references', () => {
      expect(_.pick(rows[0], ['agenda_uid', 'event_uid'])).toEqual({
        agenda_uid: 1111,
        event_uid: 2222,
      });
    });

    it('aggregated db field is null by default', () => {
      expect(rows[0].aggregated).toBeNull();
    });

    it('created result specifies aggregated to be null', () => {
      expect(result.created.aggregated).toBeNull();
    });
  });

  describe('create with some more values', () => {
    const result = {};

    beforeAll(async () => {
      result.byUser = await svc(1212).create(3434, {
        userUid: 5656,
      });

      result.aggregated = await svc(1212).create(
        9893,
        {},
        {
          aggregated: '9fae1',
        },
      );

      result.aggregatedAndUser = await svc(1212).create(
        19390,
        {
          userUid: 1929,
        },
        { aggregated: 'afd11' },
      );
    });

    it('userUid is provided in created ref', () => {
      expect(result.byUser.created.userUid).toBe(5656);
    });

    it('aggregated key is provided in created ref when set at creation', () => {
      expect(result.aggregated.created.aggregated).toBe('9fae1');
    });

    it('cannot create an entry both as aggregated and associated with user', () => {
      expect(result.aggregatedAndUser.success).toBe(false);
    });
  });

  it('simple create forcing timestamp values', async () => {
    const createdAt = new Date('2017-02-28T08:00:00.000Z');

    const updatedAt = new Date('2017-03-28T08:00:00.000Z');

    const result = await svc(62792452).create(
      3333,
      {
        featured: true,
        state: 2,
        createdAt,
        updatedAt,
      },
      { protected: false },
    );

    expect(result.created.createdAt.toString()).toBe(createdAt.toString());

    expect(result.created.updatedAt.toString()).toBe(updatedAt.toString());
  });

  it('context can be passed in options to be transfered to onCreate interface', () =>
    new Promise((rs) => {
      svc = Service(
        ih(config, {
          interfaces: {
            onCreate: {
              $set: (created, context) => {
                expect(context.userUid).toBe(111);
              },
            },
          },
        }),
      );

      svc(1212)
        .create(
          3445,
          {},
          {
            context: {
              userUid: 111,
            },
          },
        )
        .then(() => rs());
    }));

  it('when no context is passed, default context values are given', () =>
    new Promise((rs) => {
      svc = Service(
        ih(config, {
          interfaces: {
            onCreate: {
              $set: (created, context) => {
                expect(context.userUid).toBeNull();
              },
            },
          },
        }),
      );

      svc(1212)
        .create(3445)
        .then(() => rs());
    }));

  it('set canEdit to true in second create argument', async () => {
    const { created } = await svc(1212).create(3446, { canEdit: true });

    expect(created.canEdit).toBe(true);
  });

  it('creating refused ref with motive', async () => {
    const { created } = await svc(1212).create(38923893, {
      state: -1,
      motive: 'Hopopop',
    });

    expect(created.motive).toBe('Hopopop');
  });
});
