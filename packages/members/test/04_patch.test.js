'use strict';

const config = require('../testconfig');
const Service = require('..');
const fixtures = require('./fixtures');
const getUsersByUid = require('./fixtures/getUsersByUid');
const getEventCountByUserUid = require('./fixtures/getEventCountByUserUid');
const getAgendasByUid = require('./fixtures/getAgendasByUid');

describe('members - functional - patch', () => {
  const f = fixtures(config.mysql);

  let svc;
  let onPatchArguments;

  beforeAll(async () => {
    await f.load();

    svc = Service({
      knex: f.client,
      interfaces: {
        getUsersByUid,
        getAgendasByUid,
        getEventCountByUserUid,
        onPatch: (before, after, context) => {
          onPatchArguments = { before, after, context };
        },
      },
    });
  });

  afterAll(f.destroyClient);

  describe('simple patch', () => {
    let result;

    beforeAll(async () => {
      result = await svc.patch(
        { userUid: 2, agendaUid: 1 },
        {
          custom: {
            organization: 'OpenAgenda',
            contactNumber: '06 50 91 60 26',
            contactName: 'Gaetan',
            contactPosition: 'Support',
            email: 'kaore@openagenda.com',
          },
        },
        {
          context: {
            lang: 'fr',
          },
        },
      );
    });

    test('provided field is updated', async () => {
      const member = await svc.get({ userUid: 2, agendaUid: 1 });

      expect(member.custom).toEqual({
        organization: 'OpenAgenda',
        contactNumber: '06 50 91 60 26',
        contactName: 'Gaetan',
        contactPosition: 'Support',
        email: 'kaore@openagenda.com',
      });
    });

    test('legacy fields are provided in result', () => {
      expect(result.member.userId).toBe(81290);
    });

    test('interface provides member before and after patch', () => {
      const { before, after } = onPatchArguments;

      expect(before.custom.contactName).toBe('JC Ponceau');
      expect(after.custom.contactName).toBe('Gaetan');
    });

    test('if context is provided in patch options it is passed to interface', () => {
      const { context } = onPatchArguments;

      expect(context).toEqual({
        lang: 'fr',
        redirect: null,
        sender: {
          memberName: null,
          userUid: null,
        },
        message: null,
      });
    });
  });

  describe('errors', () => {
    test('by default service does not throw if provided data is invalid', async () => {
      const result = await svc.patch(
        { userUid: 1, agendaUid: 2 },
        { custom: { contactName: null } },
      );

      expect(Array.isArray(result.errors)).toBeTruthy();
    });

    test('throwOnError at true throws if provided data is invalid', async () => {
      let error;
      try {
        await svc.patch(
          { userUid: 1, agendaUid: 2 },
          { custom: { contactName: null } },
          { throwOnError: true },
        );
      } catch (e) {
        error = e;
      }

      expect(error.name).toBe('BadRequest');
      expect(Array.isArray(error.info.errors)).toBeTruthy();
    });
  });

  describe('options', () => {
    test('requireCustom at true means not all member default custom data is required', async () => {
      const result = await svc.patch(
        { userUid: 1, agendaUid: 2 },
        { custom: { contactName: null } },
        { requireCustom: false },
      );

      expect(result.success).toBe(true);
    });
  });

  describe('legacy', () => {
    test('if user identifier is specified in patch, legacy is updated', async () => {
      const { member } = await svc.patch(
        { userUid: 1, agendaUid: 2 },
        { userUid: 3 },
      );

      expect(member.userId).toBe(10293);
    });

    test('if agenda identifier is specified in patch, legacy is updated', async () => {
      const { member } = await svc.patch(
        { userUid: 1, agendaUid: 1 },
        { agendaUid: 12 },
      );

      expect(member.agendaId).toBe(919002);
    });
  });

  test('deletedUser can be patched', async () => {
    const { member } = await svc.patch(
      { userUid: 2, agendaUid: 1 },
      { deletedUser: true },
    );

    expect(member.deletedUser).toBe(true);
  });

  test('increment increments actions counter', async () => {
    const memberBefore = await svc.get({ agendaUid: 1, userUid: 22 });

    await svc.patch.actions.increment({ agendaUid: 1, userUid: 22 });

    const memberAfter = await svc.get({ agendaUid: 1, userUid: 22 });

    expect(memberAfter.actionsCounter).toEqual(memberBefore.actionsCounter + 1);
  });
});
