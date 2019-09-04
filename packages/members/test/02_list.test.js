'use strict';

const _ = require('lodash');

const Service = require('../');
const config = require('../testconfig');
const fixtures = require('./fixtures');
const getUsersByUid = require('./fixtures/getUsersByUid');
const getEventCountByUserUid = require('./fixtures/getEventCountByUserUid');
const getAgendasByUid = require('./fixtures/getAgendasByUid');

describe('members - functional - list', () => {
  const f = fixtures(config.mysql);
  let svc;

  beforeAll(async () => {
    await f.load();

    svc = Service({
      knex: f.client,
      interfaces: {
        getUsersByUid,
        getAgendasByUid,
        getEventCountByUserUid
      }
    });
  });

  afterAll(f.destroyClient);

  describe('basic', () => {
    let members;

    beforeAll(async () => {
      members = await svc.list({ agendaUid: 1 }, { limit: 1 });
    });

    test('length matches specified limit', () => {
      expect(members).toHaveLength(1);
    });

    test('provides a list in response', async () => {
      expect(_.omit(members[0], ['createdAt', 'updatedAt'])).toEqual({
        id: 1,
        order: 1,
        actionsCounter: 12,
        agendaUid: 1,
        userUid: 1,
        invited: false,
        role: 2,
        slug: 'janine',
        custom: {
          organization: 'Mairie de Saint-Germain-en-Laye',
          contactName: 'Janine Ponceau',
          contactNumber: '0130872171',
          contactPosition: 'Responsable de la diffusion artistique',
          email: 'janine@ponceau.fr'
        },
        deletedUser: false
      });
    });

    test('by default, user details are not provided', async () => {
      expect(members[0].user).toBeUndefined();
    });

    test('get member references for multiple userUids', async () => {
      const otherMembers = await svc.list({
        agendaUid: 1,
        userUid: [1, 2, 22]
      });
      expect(otherMembers.map(m => m.id)).toEqual([1, 2, 4]);
    });
  });

  describe('pagination', () => {
    test('with "after" and "limit" keys', async () => {
      const query = { agendaUid: 1 };

      const first = await svc.list(query, { limit: 1 });

      const second = await svc.list(query, { after: 1, limit: 1 });

      expect(first[0].id).toBe(1);
      expect(second[0].id).toBe(2);
    });

    test('with "offset" and "limit" keys', async () => {
      const second = await svc.list({ agendaUid: 1 }, { offset: 1, limit: 1 });
      expect(second[0].id).toBe(2);
    });

    test('with "page" and "limit" keys', async () => {
      const second = await svc.list({ agendaUid: 1 }, { page: 2, limit: 1 });
      expect(second[0].id).toBe(2);
    });

    test('use order key of previous result to fetch following values', async () => {
      const first = _.first(
        await svc.list(
          { agendaUid: 1 },
          {
            order: 'slug.desc',
            limit: 1
          }
        )
      );

      expect(first.slug).toBe('jean-claude');

      const second = _.first(
        await svc.list(
          { agendaUid: 1 },
          {
            order: 'slug.desc',
            limit: 1,
            after: ['jean-claude', 2]
          }
        )
      );

      expect(second.slug).toBe('janine');
    });
  });

  describe('legacy', () => {
    test('when legacy option is set to true, legacy values are provided', async () => {
      const { stakeholders } = await svc.list(
        { agendaUid: 1 },
        { limit: 1 },
        { legacy: true }
      );

      expect(
        _.pick(stakeholders[0], [
          'agendaId',
          'credential',
          'userId',
          'actionsCounter'
        ])
      ).toEqual({
        agendaId: 923,
        userId: 81289,
        credential: 2,
        actionsCounter: 12
      });
    });

    test('if organization is stored as slug/label, only label is given in listed result', async () => {
      const members = await svc.list({ agendaUid: 2 });

      expect(members[0].custom.organization).toBe('OpenAgenda');
    });

    test('if query includes "credentials" value, it is interpreted as a "role" filter', async () => {
      const members = await svc.list({
        agendaUid: 1,
        credentials: 'administrator'
      });

      expect(members[0].id).toBe(1);
    });
  });

  describe('ordering', () => {
    test('default ordering is ascending id', async () => {
      const members = await svc.list({ agendaUid: 1 });

      expect(members.map(m => m.order)).toEqual([1, 2, 4, 5]);
    });

    test('ordering by descending id', async () => {
      const members = await svc.list(
        { agendaUid: 1 },
        {
          order: 'id.desc'
        }
      );

      expect(members.map(m => m.order)).toEqual([5, 4, 2, 1]);
    });

    test('ordering by ascending slug', async () => {
      const members = await svc.list(
        { agendaUid: 1 },
        {
          order: 'slug.asc'
        }
      );

      expect(members.map(m => m.order[0])).toEqual([
        null,
        'albertine',
        'janine',
        'jean-claude'
      ]);
    });

    test('ordering by descending slug', async () => {
      const members = await svc.list(
        { agendaUid: 1 },
        {
          order: 'slug.desc'
        }
      );

      expect(members.map(m => m.order[0])).toEqual([
        'jean-claude',
        'janine',
        'albertine',
        null
      ]);
    });

    test('ordering by descending actions', async () => {
      const { stakeholders } = await svc.list(
        { agendaUid: 1 },
        {
          order: 'actionsCounter.desc'
        },
        { legacy: true }
      );

      expect(stakeholders.map(m => m.actionsCounter)).toEqual([12, 5, 5, 0]);
    });

    test('fix: ordering with after always sorts id asc', async () => {
      expect(
        (await svc.list(
          { agendaUid: 1 },
          {
            limit: 2,
            order: 'actionsCounter.desc',
            after: [5, 2]
          }
        ))[0].id
      ).toBe(4);
    });
  });

  describe('stream', () => {
    test('takes args as list but without pagination info', done => {
      // limit is not needed here, just for testing buffer refill
      const stream = svc.stream(
        { agendaUid: 1 },
        { limit: 2, order: 'actionsCounter.asc' },
        {
          transform: m => m.id
        }
      );

      const streamedMemberIds = [];

      stream.on('data', memberId => {
        streamedMemberIds.push(memberId);
      });

      stream.on('end', () => {
        expect(streamedMemberIds).toEqual([5, 2, 4, 1]);

        done();
      });
    });
  });

  describe('detailed', () => {
    let members;

    beforeAll(async () => {
      members = await svc.list(
        { agendaUid: 1 },
        { limit: 2 },
        { detailed: true }
      );
    });

    test('when true, event count is provided', () => {
      expect(members.map(m => m.eventCount)).toEqual([12, 0]);
    });

    test('when true, user details are provided in user sub key', () => {
      expect(members[0].user).toEqual({
        id: 10293,
        uid: 1,
        fullName: 'Janine Ponceau'
      });
    });

    test('when true, agenda details are provided in agenda sub key', () => {
      expect(members[0].agenda).toEqual({
        id: 10932,
        uid: 1,
        title: 'Les JEP'
      });
    });

    test('when total and detailed are true, counts for each role are provided', async () => {
      const otherMembers = await svc.list(
        {
          agendaUid: 1
        },
        { limit: 1 },
        { total: true, detailed: true }
      );

      expect(otherMembers.total).toBe(4);

      expect(otherMembers.totalPerRole).toEqual({
        contributor: 3,
        administrator: 1
      });
    });
  });

  describe('other', () => {
    test('when withUser is false, only userless members are provided', async () => {
      const members = await svc.list({ agendaUid: 1, withUser: false });

      expect(members).toHaveLength(1);
      expect(members[0].userUid).toBeNull();
    });

    test('search looks in store field', async () => {
      const members = await svc.list({ agendaUid: 1, search: 'Janine' });

      expect(members[0].id).toBe(1);
      expect(members).toHaveLength(1);
    });

    test('when total option is true, total is given in response', async () => {
      const { total, members } = await svc.list(
        { agendaUid: 1 },
        { limit: 1 },
        { total: true }
      );

      expect(total).toBe(4);

      expect(members).toHaveLength(1);
    });

    test('when deletedUser is null, members marked as associated with deleted user are included in results', async () => {
      const members = await svc.list({ agendaUid: 1, deletedUser: null });

      expect(members.filter(m => m.deletedUser === true)).toHaveLength(1);
    });

    test('when deletedUser is not provided, members marked as associated with deleted user are not in results', async () => {
      const members = await svc.list({ agendaUid: 1 });

      expect(members.filter(m => m.deletedUser === true)).toHaveLength(0);
    });

    test('when deletedUser is true, only members marked as associated with deleted user are in results', async () => {
      const members = await svc.list({
        agendaUid: 1,
        deletedUser: true
      });

      expect(members).toHaveLength(1);
      expect(members[0].deletedUser).toBe(true);
    });

    test('when ids are given to list, matching members are provided', async () => {
      const members = await svc.list({ id: [3, 5] });

      expect(members.map(m => m.id)).toEqual([3, 5]);
    });

    test('fix: limit can be set as zero to fetch totals only', async () => {
      const { members, total } = await svc.list(
        { agendaUid: 1 },
        { limit: 0 },
        {
          total: true,
          detailed: true
        }
      );

      expect(members).toHaveLength(0);
      expect(total).toBeGreaterThan(0);
    });
  });
});
