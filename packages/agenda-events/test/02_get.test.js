import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import _ from 'lodash';

import Service from '../index.js';
import config from '../testconfig.js';
import setup from './fixtures/setup.js';
import membersFixtures from './fixtures/members.json' with { type: 'json' };
import usersFixtures from './fixtures/users.json' with { type: 'json' };
import sourceAgendasFixtures from './fixtures/sourceAgendas.json' with { type: 'json' };

const __dirname = dirname(fileURLToPath(import.meta.url));

describe('agendaEvents - 02 - functional (server): get', () => {
  let knex;
  let svc;

  beforeAll(async () => {
    knex = await setup({
      mysql: config.mysql,
      schemas: config.schemas,
      data: [`${__dirname}/fixtures/agenda_event.data.sql`],
    });

    svc = Service({
      ...config,
      knex,
      interfaces: {
        ...config.interfaces,
        getMembers: async (aes) =>
          aes.map((ae) =>
            _.find(membersFixtures, {
              agendaUid: ae.agendaUid,
              userUid: ae.userUid,
            })),
        getUsers: async (aes) =>
          []
            .concat(aes)
            .map((ae) => usersFixtures.find((u) => u.uid === ae.userUid)),
        getSourceAgendas: async (sourceAgendaUids) =>
          sourceAgendasFixtures.filter((agenda) =>
            sourceAgendaUids.includes(agenda.uid)),
      },
    });
  });

  afterAll(() => knex?.destroy());

  describe('simple get', () => {
    let ref;

    beforeAll(async () => {
      ref = await svc(62792452).get(10974548);
    });

    it('agendaUid, eventUid, userUid are provided', () => {
      expect(ref.agendaUid).toBe(62792452);
      expect(ref.eventUid).toBe(10974548);
      expect(ref.userUid).toBe(12312312);
    });

    it('if aggregated, sourcePaths are provided and aggregated bool is true', () => {
      expect(ref.sourcePaths).toEqual([[6789678], [896785]]);
      expect(ref.aggregated).toBe('achecksumvalue');
    });

    it('canEdit bool indicates if agenda has edit rights on event', () => {
      expect(ref.canEdit).toBe(false);
    });

    it('state in agenda is provided', () => {
      expect(ref.state).toBe(config.eventStates.VALIDATED);
    });

    it('featured bool is provided', () => {
      expect(ref.featured).toBe(false);
    });
  });

  it('get with decorate to get member details', async () => {
    const ref = await svc(62792452).get(10974548, {
      decorate: ['member'],
    });

    expect(ref.member).toEqual({
      agendaUid: 62792452,
      userUid: 12312312,
      role: 1,
    });
  });

  it('get with decorate to get user details', async () => {
    const ref = await svc(62792452).get(10974548, {
      decorate: ['user'],
    });

    expect(ref.user).toEqual({
      uid: 12312312,
      fullName: 'Kevin',
    });
  });

  it('get with decorate to get sourceAgenda details', async () => {
    const ref = await svc(62792452).get(10974548, {
      decorate: ['sourceAgendas'],
    });

    expect(ref.sourceAgendas).toEqual([
      {
        uid: 6789678,
        title: 'La source',
      },
      {
        uid: 896785,
        title: 'Et encore une source',
      },
    ]);
  });

  it('explicit error is thrown when event uid is not provided', async () => {
    let error;
    try {
      await svc(62792452).get();
    } catch (e) {
      error = e;
    }
    expect(error.message).toBe('Event uid is missing');
  });

  it('explicit error is thrown when agenda uid is not provided', async () => {
    let error;
    try {
      await svc().get(10974548);
    } catch (e) {
      error = e;
    }

    expect(error.message).toBe('Agenda uid is missing');
  });

  it('get provides empty sourcePaths list when none are stored in entry', async () => {
    const ae = await svc(62792452).get(53117383);

    expect(ae.sourcePaths).toEqual([]);
  });

  it('get provides sourcePaths as list of uids (or list of list) when a json is stored in entry', async () => {
    const ae = await svc(62792452).get(60059313);

    expect(ae.sourcePaths).toEqual([11, [22], 33]);
  });

  it('get returns null if no match is found', async () => {
    expect(await svc(62792452).get(60059377)).toBeNull();
  });

  it('get throws not found error if option is set', async () => {
    let error;
    try {
      await svc(62792452).get(60059377, {
        throwOnNotFound: true,
      });
    } catch (e) {
      error = e;
    }
    expect(error.name).toBe('NotFound');
  });

  it('an item contains agenda & event references, state, featured bool and custom data', async () => {
    const ref = await svc(62792452).get(10974548);
    expect(Object.keys(ref)).toEqual([
      'eventUid',
      'agendaUid',
      'userUid',
      'aggregated',
      'sourcePaths',
      'featured',
      'canEdit',
      'state',
      'createdAt',
      'updatedAt',
      'motive',
    ]);
  });

  it('get with removed option at true', async () => {
    const ref = await svc(62792452).get(53117384, { removed: true });
    expect(ref.removed).toEqual(true);
  });

  it('get with removed option null', async () => {
    const ref = await svc(62792452).get(53117384, { removed: null });
    expect(ref.removed).toEqual(true);
  });

  it('get without removed option does not get removed item', async () => {
    const ref = await svc(62792452).get(53117384, {});
    expect(ref).toEqual(null);
  });
});
