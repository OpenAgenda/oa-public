'use strict';

const _ = require('lodash');

const config = require('../testconfig');
const Service = require('..');
const fixtures = require('./fixtures');
const getUsersByUid = require('./fixtures/getUsersByUid');
const getEventCountByUserUid = require('./fixtures/getEventCountByUserUid');
const getUserByEmail = require('./fixtures/getUserByEmail');

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
        getUserByEmail,
      },
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
        userUid: 2,
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

    test('updatedAt information is in response', async () => {
      expect(member.updatedAt instanceof Date).toBe(true);
    });

    test('if throwOnNotFound is specified, throws if no member is found', async () => {
      let error;
      try {
        await svc.get(
          { agendaUid: 18839, userUid: 3 },
          { throwOnNotFound: true },
        );
      } catch (e) {
        error = e;
      }
      expect(error.name).toBe('NotFound');
    });

    test('custom data is provided in custom key', () => {
      expect(member.custom).toEqual({
        organization: 'Idpt',
        contactNumber: '013072171',
        contactName: 'JC Ponceau',
        contactPosition: 'Responsable des pains',
        email: 'jc@ponceau.fr',
      });
    });

    test('member can also be fetched by agenda uid and member id', async () => {
      const otherMember = await svc.get({ agendaUid: 2, id: 3 });

      expect(otherMember.id).toBe(3);
    });

    test('legacy fields are provided if legacy option is set to true', async () => {
      const otherMember = await svc.get(
        { agendaUid: 1, userUid: 2 },
        { legacy: true },
      );

      expect(otherMember.userId).toBe(81290);
      expect(otherMember.agendaId).toBe(923);
    });

    test('user detail is provided when detailed option is set to true', async () => {
      const otherMember = await svc.get(
        { agendaUid: 1, userUid: 2 },
        { detailed: true },
      );

      expect(otherMember.user).toEqual({
        id: 10293,
        uid: 1,
        fullName: 'Janine Ponceau',
      });
    });

    test('getByEmail looks in record store for queried email', async () => {
      const otherMember = await svc.get.byEmail({
        agendaUid: 1,
        email: 'janine@ponceau.fr',
      });

      expect(otherMember.id).toBe(1);
    });

    test('getByEmail gets by email through interface when necessary', async () => {
      const otherMember = await svc.get.byEmail({
        agendaUid: 1,
        email: 'truc@delinterface.fr',
      });

      expect(otherMember.id).toBe(4);
    });

    test('customDataAtRoot option puts member data at root of result', async () => {
      const sameMember = await svc.get(
        {
          agendaUid: 1,
          userUid: 2,
        },
        { customDataAtRoot: true },
      );

      expect(_.omit(sameMember, ['updatedAt'])).toEqual({
        id: 2,
        deletedUser: false,
        invited: false,
        agendaUid: 1,
        role: 1,
        userUid: 2,
        organization: 'Idpt',
        contactNumber: '013072171',
        contactName: 'JC Ponceau',
        contactPosition: 'Responsable des pains',
        email: 'jc@ponceau.fr',
        actionsCounter: 5,
      });
    });
  });
});
