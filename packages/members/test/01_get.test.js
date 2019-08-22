'use strict';

const _ = require('lodash');

const Service = require('../');
const config = require('../testconfig');
const fixtures = require('./fixtures');
const getUsersByUid = require('./fixtures/getUsersByUid');
const getEventCountByUserUid = require('./fixtures/getEventCountByUserUid');
const getUserUidByEmail = require('./fixtures/getUserUidByEmail');

describe('members - functional - get', () => {
  const f = fixtures(config.mysql);
  let svc;

  beforeAll(async () => {
    await f.load();

    svc = Service({
      knex: f.client,
      interfaces: {
        getUsersByUid,
        getEventCountByUserUid,
        getUserUidByEmail
      }
    });
  });

  afterAll(f.destroyClient);

  describe('basic', () => {
    let member;

    beforeAll(async () => {
      member = await svc.get({ agendaUid: 1, userUid: 2 });
    });

    test('fetched member includes user and agenda uids', () => {
      expect(_.pick(member, ['userUid', 'agendaUid'])).toEqual({
        agendaUid: 1,
        userUid: 2
      });
    });

    test('fetched member includes role', () => {
      expect(member.role).toBe(1);
    });

    test('by default, legacy fields are not provided', () => {
      expect(member.credential).toBeUndefined();
      expect(member.userId).toBeUndefined();
      expect(member.agendaId).toBeUndefined();
    });

    test('by default, user details is not provided', () => {
      expect(member.user).toBeUndefined();
    });

    test('when member is not found, returns null', async () => {
      const otherMember = await svc.get({ agendaUid: 18839, userUid: 3 });

      expect(otherMember).toBeNull();
    });

    test('custom data is provided in custom key', () => {
      expect(member.custom).toEqual({
        organization: 'Idpt',
        contactNumber: '013072171',
        contactName: 'JC Ponceau',
        contactPosition: 'Responsable des pains',
        email: 'jc@ponceau.fr'
      });
    });

    test('member can also be fetched by agenda uid and member id', async () => {
      const otherMember = await svc.get({ agendaUid: 2, id: 3 });

      expect(otherMember.id).toBe(3);
    });

    test('legacy fields are provided if legacy option is set to true', async () => {
      const otherMember = await svc.get(
        { agendaUid: 1, userUid: 2 },
        { legacy: true }
      );

      expect(otherMember.userId).toBe(81290);
      expect(otherMember.agendaId).toBe(923);
    });

    test('user detail is provided when detailed option is set to true', async () => {
      const otherMember = await svc.get(
        { agendaUid: 1, userUid: 2 },
        { detailed: true }
      );

      expect(otherMember.user).toEqual({
        id: 10293,
        uid: 1,
        fullName: 'Janine Ponceau'
      });
    });

    test('getByEmail looks in record store for queried email', async () => {
      const otherMember = await svc.get.byEmail({
        agendaUid: 1,
        email: 'janine@ponceau.fr'
      });

      expect(otherMember.id).toBe(1);
    });

    test('getByEmail gets by email through interface when necessary', async () => {
      const otherMember = await svc.get.byEmail({
        agendaUid: 1,
        email: 'janeen@oa.com'
      });

      expect(otherMember.id).toBe(4);
    });
  });
});
