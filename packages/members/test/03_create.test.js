'use strict';

const _ = require('lodash');

const Service = require('../');
const config = require('../testconfig');
const fixtures = require('./fixtures');
const getUsersByUid = require('./fixtures/getUsersByUid');
const getEventCountByUserUid = require('./fixtures/getEventCountByUserUid');
const getAgendasByUid = require('./fixtures/getAgendasByUid');

describe('members - functional - create', () => {
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

  test('simple create creates', async () => {
    const { member } = await svc.create({
      userUid: 12,
      agendaUid: 31,
      role: 1,
      actionsCounter: null,
      custom: {
        organization: 'OpenAgenda',
        contactName: 'Gaetan',
        contactNumber: '01 23 45 67 89',
        email: 'support@openagenda.com',
        contactPosition: 'Support'
      }
    });

    expect(_.omit(member, ['id', 'createdAt', 'updatedAt'])).toEqual({
      agendaUid: 31,
      userUid: 12,
      userId: 10293,
      agendaId: 919002,
      custom: {
        organization: 'OpenAgenda',
        contactName: 'Gaetan',
        contactNumber: '01 23 45 67 89',
        contactPosition: 'Support',
        email: 'support@openagenda.com'
      },
      invited: false,
      deletedUser: false,
      actionsCounter: null,
      role: 1
    });
  });

  test('if member with same userUid and agendaUid already exists, error is thrown', async () => {
    let error = null;

    try {
      await svc.create(
        {
          userUid: 1,
          agendaUid: 1,
          role: 1
        },
        { requireCustom: false }
      );
    } catch (e) {
      error = e;
    }

    expect(error.message).toBe('Already exists');
  });

  test('by default, custom data is required for create', async () => {
    const result = await svc.create({
      userUid: 1,
      role: 2
    });

    expect(result.errors).toHaveLength(5);
  });

  test('if requireCustom is false, custom data is optional', async () => {
    const result = await svc.create(
      {
        userUid: 1,
        role: 1
      },
      { requireCustom: false }
    );

    expect(result.errors).toHaveLength(0);
  });

  test('if userUid is not specified at create, member is marked as invited', async () => {
    const result = await svc.create(
      {
        agendaUid: 123,
        role: 1
      },
      { requireCustom: false }
    );

    expect(result.member.invited).toBe(true);
  });

  test('if userUid is specified at create, member is not marked as invited', async () => {
    const { member } = await svc.create(
      {
        agendaUid: 123,
        userUid: 193,
        role: 1
      },
      { requireCustom: false }
    );

    expect(member.invited).toBe(false);
  });
});
